-- ================================================================
-- CareOn Schema v3 — 추가분
-- 1) guardian_invitations  (보호자 초대 코드)
-- 2) patients.gps_lat/lng (수급자 댁 GPS 좌표 → 거리 검증용)
-- 3) visits.photos        (케어 사진 URL 배열)
-- 4) visits RLS 보강       (보호자도 본인 어르신 visits 조회 가능)
-- 5) patient_guardians INSERT 정책 보강 (초대코드로 본인 추가 가능)
-- 6) storage.objects 정책  (care-photos 버킷)
-- ================================================================

-- ── 1. patients GPS 좌표 ─────────────────────────────────────────
alter table public.patients add column if not exists gps_lat numeric(9,6);
alter table public.patients add column if not exists gps_lng numeric(9,6);

-- ── 2. visits 사진 + 거리 ────────────────────────────────────────
alter table public.visits add column if not exists photos jsonb default '[]'::jsonb;
alter table public.visits add column if not exists checkin_distance_m integer;

-- ── 3. guardian_invitations 테이블 ───────────────────────────────
create table if not exists public.guardian_invitations (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  patient_id    uuid not null references public.patients(id) on delete cascade,
  center_id     uuid not null references public.centers(id) on delete cascade,
  relationship  text default '자녀',
  phone         text,
  expires_at    timestamptz not null default (now() + interval '7 days'),
  used_at       timestamptz,
  used_by       uuid references auth.users(id) on delete set null,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);
alter table public.guardian_invitations enable row level security;

create index if not exists gi_code_idx on public.guardian_invitations(code) where used_at is null;

-- 센터장: 본인 센터 초대 전체 관리
create policy "gi_admin_all" on public.guardian_invitations
  for all using (center_id = public.get_my_center_id())
  with check (center_id = public.get_my_center_id());

-- 가입 플로우: 미사용·미만료 초대를 익명/로그인 사용자가 코드로 검증
create policy "gi_validate_public" on public.guardian_invitations
  for select using (used_at is null and expires_at > now());

-- ── 4. 초대 코드 생성 함수 (헷갈리는 문자 I, O, 0, 1 제외) ────────
create or replace function public.generate_invite_code()
returns text language sql volatile as $$
  select string_agg(
    substring('ABCDEFGHJKLMNPQRSTUVWXYZ23456789' from (floor(random()*32)::int + 1) for 1),
    ''
  )
  from generate_series(1,8)
$$;

-- ── 5. 초대 사용 처리 함수 (본인 보호자 등록 + patient_guardians 자동 INSERT) ──
create or replace function public.redeem_invitation(p_code text)
returns json language plpgsql security definer as $$
declare
  inv record;
  result json;
begin
  -- 코드 검증
  select * into inv from public.guardian_invitations
  where code = upper(p_code) and used_at is null and expires_at > now();

  if inv is null then
    return json_build_object('success', false, 'error', '유효하지 않거나 만료된 초대 코드입니다');
  end if;

  -- profile 보장 (없으면 guardian으로 생성)
  insert into public.profiles (id, role, center_id)
    values (auth.uid(), 'guardian', inv.center_id)
  on conflict (id) do update
    set role = case when public.profiles.role = 'guardian' then 'guardian' else public.profiles.role end,
        center_id = coalesce(public.profiles.center_id, inv.center_id);

  -- patient_guardians 연결
  insert into public.patient_guardians (patient_id, guardian_id, relationship, is_primary, notify_enabled)
    values (inv.patient_id, auth.uid(), coalesce(inv.relationship, '자녀'), false, true)
  on conflict (patient_id, guardian_id) do nothing;

  -- 초대 사용 처리
  update public.guardian_invitations
    set used_at = now(), used_by = auth.uid()
    where id = inv.id;

  return json_build_object(
    'success', true,
    'patient_id', inv.patient_id,
    'center_id', inv.center_id,
    'relationship', inv.relationship
  );
end;
$$;

-- ── 6. visits RLS 보강 (보호자도 본인 어르신 조회) ───────────────
drop policy if exists "visits_select" on public.visits;
create policy "visits_select" on public.visits for select using (
  center_id = public.get_my_center_id()
  or patient_id in (select patient_id from public.patient_guardians where guardian_id = auth.uid())
  or public.get_my_role() = 'superadmin'
);

-- patients SELECT도 동일하게 보강 (보호자가 본인 어르신 정보 조회)
drop policy if exists "patients_select" on public.patients;
create policy "patients_select" on public.patients for select using (
  center_id = public.get_my_center_id()
  or id in (select patient_id from public.patient_guardians where guardian_id = auth.uid())
  or public.get_my_role() = 'superadmin'
);

-- workers SELECT 보강 (보호자가 담당 보호사 정보 조회)
drop policy if exists "workers_select" on public.workers;
create policy "workers_select" on public.workers for select using (
  center_id = public.get_my_center_id()
  or id in (
    select worker_id from public.visits where patient_id in (
      select patient_id from public.patient_guardians where guardian_id = auth.uid()
    )
  )
  or public.get_my_role() = 'superadmin'
);

-- ── 7. patient_guardians INSERT 보강 (초대 redeem 함수가 처리) ────
drop policy if exists "pg_insert_admin" on public.patient_guardians;
create policy "pg_insert" on public.patient_guardians
  for insert with check (
    patient_id in (select id from public.patients where center_id = public.get_my_center_id())
    or guardian_id = auth.uid()
  );

-- ── 8. Storage 버킷 정책 (Supabase Dashboard에서 먼저 버킷 생성 필요) ──
-- Dashboard → Storage → New Bucket → name: care-photos, public: false
-- 그 후 아래 정책 실행:

-- 보호사: 본인 센터 사진 업로드/조회/삭제
do $$ begin
  if exists (select 1 from storage.buckets where id = 'care-photos') then
    drop policy if exists "care_photos_worker_all" on storage.objects;
    create policy "care_photos_worker_all" on storage.objects
      for all using (
        bucket_id = 'care-photos'
        and (
          public.get_my_role() in ('admin', 'worker', 'superadmin')
          and (storage.foldername(name))[1] = public.get_my_center_id()::text
        )
      );

    -- 보호자: 본인 어르신 사진만 조회
    drop policy if exists "care_photos_guardian_read" on storage.objects;
    create policy "care_photos_guardian_read" on storage.objects
      for select using (
        bucket_id = 'care-photos'
        and (
          public.get_my_role() = 'guardian'
          -- 경로 형식: <center_id>/<patient_id>/<visit_id>/<filename>
          and (storage.foldername(name))[2] in (
            select patient_id::text from public.patient_guardians where guardian_id = auth.uid()
          )
        )
      );
  end if;
end $$;

-- ================================================================
-- 사용 예시
-- ================================================================
-- -- 센터장: 초대 코드 생성
-- insert into guardian_invitations (code, patient_id, center_id, relationship, phone, created_by)
-- values (generate_invite_code(), '<patient_id>', '<center_id>', '자녀', '01012345678', auth.uid())
-- returning code;
--
-- -- 보호자(가입 후): 코드 redeem
-- select redeem_invitation('ABC23DEF');
-- -- → { success: true, patient_id: ..., center_id: ... }
