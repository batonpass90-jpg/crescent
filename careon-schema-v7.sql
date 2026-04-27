-- ================================================================
-- CareOn Schema v7 — 마케팅 페이지 상담 신청 테이블
-- 1) consultations 테이블 (방문자가 남긴 상담 신청)
-- 2) submit_consultation() RPC (익명 사용자도 INSERT 가능)
-- 3) 센터장 알림 트리거 (선택적, Edge Function이 처리)
-- 4) centers 테이블 확장 (사업자번호, 지정번호 등)
-- ================================================================

-- ── 1. centers 테이블 확장 (Phase 2를 위한 필드 미리 추가) ───────
alter table public.centers add column if not exists business_number text;
alter table public.centers add column if not exists ltc_license_number text;
alter table public.centers add column if not exists representative_name text;
alter table public.centers add column if not exists kakao_channel_url text;
alter table public.centers add column if not exists emergency_phone text;
alter table public.centers add column if not exists location_lat numeric(9,6);
alter table public.centers add column if not exists location_lng numeric(9,6);

comment on column public.centers.business_number is '사업자등록번호 (123-45-67890 형식)';
comment on column public.centers.ltc_license_number is '장기요양기관 지정번호';
comment on column public.centers.representative_name is '대표자 성명';
comment on column public.centers.kakao_channel_url is '카카오톡 채널 URL (예: pf.kakao.com/_xxxxx)';
comment on column public.centers.emergency_phone is '24시간 응급 연락처';

-- ── 2. consultations 테이블 ──────────────────────────────────────
create table if not exists public.consultations (
  id              uuid primary key default gen_random_uuid(),
  center_id       uuid not null references public.centers(id) on delete cascade,
  patient_name    text not null,                  -- 어르신 성함
  guardian_phone  text not null,                  -- 보호자 연락처
  care_grade      text,                            -- 1~5등급 / 미신청
  message         text,                            -- 상담 내용 (선택)
  source_url      text,                            -- 어느 페이지에서 신청했는지
  user_agent      text,
  ip_hash         text,                            -- 스팸 방지용 IP 해시
  status          text not null default 'new',     -- new | contacted | converted | closed
  contacted_at    timestamptz,
  contacted_by    uuid references auth.users(id),
  notes           text,                            -- 센터 내부 메모
  created_at      timestamptz not null default now()
);
alter table public.consultations enable row level security;

create index if not exists consultations_center_idx on public.consultations(center_id, created_at desc);
create index if not exists consultations_status_idx on public.consultations(status) where status = 'new';

-- 센터장만 본인 센터 상담 조회/관리
create policy "consultations_center_admin" on public.consultations
  for all using (
    center_id = public.get_my_center_id()
    or public.get_my_role() = 'superadmin'
  );

-- 익명 INSERT 정책: 누구나 상담 신청 가능 (스팸 방지는 함수에서)
create policy "consultations_public_insert" on public.consultations
  for insert with check (true);

-- ── 3. 상담 신청 함수 (스팸 방지 + 알림 트리거) ──────────────────
create or replace function public.submit_consultation(
  p_center_slug   text,
  p_patient_name  text,
  p_guardian_phone text,
  p_care_grade    text default null,
  p_message       text default null,
  p_source_url    text default null
)
returns json language plpgsql security definer as $$
declare
  v_center_id uuid;
  v_consultation_id uuid;
  v_recent_count int;
begin
  -- 입력 검증
  if length(trim(coalesce(p_patient_name,''))) < 2 then
    return json_build_object('success', false, 'error', '어르신 성함을 정확히 입력해주세요');
  end if;
  if not p_guardian_phone ~ '^01[016789][0-9]{7,8}$|^0[2-6][0-9]{7,9}$' and not replace(p_guardian_phone, '-', '') ~ '^01[016789][0-9]{7,8}$|^0[2-6][0-9]{7,9}$' then
    return json_build_object('success', false, 'error', '연락처 형식을 확인해주세요 (예: 010-1234-5678)');
  end if;

  -- 센터 조회
  select id into v_center_id from public.centers where slug = p_center_slug;
  if v_center_id is null then
    return json_build_object('success', false, 'error', '존재하지 않는 센터입니다');
  end if;

  -- 스팸 방지: 같은 번호로 1시간 내 3회 초과 방지
  select count(*) into v_recent_count from public.consultations
  where guardian_phone = replace(p_guardian_phone, '-', '')
    and created_at > now() - interval '1 hour';
  if v_recent_count >= 3 then
    return json_build_object('success', false, 'error', '잠시 후 다시 시도해주세요');
  end if;

  -- INSERT
  insert into public.consultations (center_id, patient_name, guardian_phone, care_grade, message, source_url)
  values (v_center_id, trim(p_patient_name), replace(p_guardian_phone, '-', ''), p_care_grade, p_message, p_source_url)
  returning id into v_consultation_id;

  return json_build_object(
    'success', true,
    'consultation_id', v_consultation_id,
    'center_id', v_center_id
  );
end;
$$;

-- ── 4. 센터장 신규 상담 카운트 함수 (대시보드용) ─────────────────
create or replace function public.get_new_consultation_count()
returns integer language sql security definer stable as $$
  select count(*)::integer from public.consultations
  where center_id = public.get_my_center_id() and status = 'new'
$$;
