-- ================================================================
-- CareOn Schema v2 — 추가분
-- 1) centers.slug (서브도메인/파라미터 라우팅 키)
-- 2) patient_guardians (수급자-보호자 연결, 1:N)
-- 3) push_subscriptions (Web Push)
-- 4) notifications (푸시→알림톡→SMS 폴백 로그)
-- 5) realtime publication (visits/patients)
-- ================================================================

-- ── 1. centers 확장 ──────────────────────────────────────────────
alter table public.centers add column if not exists slug text;
alter table public.centers add column if not exists description text;
alter table public.centers add column if not exists hero_image_url text;
alter table public.centers add column if not exists business_hours text default '평일 09:00 ~ 18:00';
alter table public.centers add column if not exists service_area text;

-- 슬러그 형식 강제: 소문자 + 숫자 + 하이픈만, 3~32자
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'centers_slug_format') then
    alter table public.centers add constraint centers_slug_format
      check (slug is null or slug ~ '^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$');
  end if;
end $$;

create unique index if not exists centers_slug_idx on public.centers(slug);

-- 슬러그 자동 생성 함수 (선택적 사용)
create or replace function public.suggest_slug(center_name text)
returns text language sql immutable as $$
  select lower(regexp_replace(
    translate(center_name, '가나다라마바사아자차카타파하', 'gnldmbsajcktph'),
    '[^a-z0-9]+', '-', 'g'
  ))
$$;

-- 마케팅 사이트용 공개 조회 정책 (slug로 누구나 읽기 가능)
drop policy if exists "centers_public_by_slug" on public.centers;
create policy "centers_public_by_slug" on public.centers
  for select using (slug is not null);

-- ── 2. patient_guardians (수급자-보호자 다대다) ──────────────────
create table if not exists public.patient_guardians (
  patient_id    uuid not null references public.patients(id) on delete cascade,
  guardian_id   uuid not null references public.profiles(id) on delete cascade,
  relationship  text,                          -- 자녀 / 배우자 / 손주 등
  is_primary    boolean not null default false, -- 주 보호자 여부
  notify_enabled boolean not null default true,
  created_at    timestamptz not null default now(),
  primary key (patient_id, guardian_id)
);
alter table public.patient_guardians enable row level security;

create policy "pg_select" on public.patient_guardians
  for select using (
    guardian_id = auth.uid()
    or patient_id in (select id from public.patients where center_id = public.get_my_center_id())
    or public.get_my_role() = 'superadmin'
  );
create policy "pg_insert_admin" on public.patient_guardians
  for insert with check (
    patient_id in (select id from public.patients where center_id = public.get_my_center_id())
  );
create policy "pg_delete_admin" on public.patient_guardians
  for delete using (
    patient_id in (select id from public.patients where center_id = public.get_my_center_id())
  );

-- 보호자 → 본인 수급자 조회 헬퍼
create or replace function public.get_my_patients()
returns setof public.patients language sql security definer stable as $$
  select p.* from public.patients p
  join public.patient_guardians pg on pg.patient_id = p.id
  where pg.guardian_id = auth.uid() and p.status = 'active'
$$;

-- ── 3. push_subscriptions (Web Push 구독) ────────────────────────
create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  center_id   uuid references public.centers(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  user_agent  text,
  last_used   timestamptz default now(),
  created_at  timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;

create policy "push_subs_self_all" on public.push_subscriptions
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Edge Function이 발송 시 service_role로 우회하므로 별도 정책 불필요

-- ── 4. notifications (발송 로그 + 폴백 추적) ────────────────────
create table if not exists public.notifications (
  id              uuid primary key default gen_random_uuid(),
  center_id       uuid references public.centers(id) on delete set null,
  recipient_id    uuid references auth.users(id) on delete set null,
  recipient_phone text,
  recipient_name  text,
  type            text not null,         -- visit_start / care_complete / unpaid / custom
  title           text not null,
  body            text,
  url             text,                  -- 클릭 시 이동할 URL
  channel         text not null,         -- push / kakao / sms
  status          text not null default 'pending', -- pending / sent / failed
  error_message   text,
  meta            jsonb default '{}'::jsonb,
  sent_at         timestamptz,
  created_at      timestamptz not null default now()
);
alter table public.notifications enable row level security;

create index if not exists notif_recipient_idx on public.notifications(recipient_id, created_at desc);
create index if not exists notif_center_idx    on public.notifications(center_id, created_at desc);

create policy "notif_recipient_read" on public.notifications
  for select using (
    recipient_id = auth.uid()
    or center_id = public.get_my_center_id()
    or public.get_my_role() = 'superadmin'
  );
-- 발송 INSERT는 Edge Function (service_role)이 담당

-- ── 5. Realtime publication (보호자 앱 실시간 갱신용) ────────────
-- visits 테이블 변경 시 보호자 앱이 자동 업데이트되도록 publication 활성화
-- Supabase Dashboard → Database → Replication에서도 가능
do $$ begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime add table public.visits;
alter publication supabase_realtime add table public.notifications;

-- ── 6. 시드 슬러그 (테스트용 - 실 데이터 적용 후 삭제) ───────────
-- update public.centers set slug = 'sunshine' where name = '햇살요양센터';
-- update public.centers set slug = 'seoulcare' where name = '서울케어';

-- ================================================================
-- 사용 예시 (검증용)
-- ================================================================
-- select id, name, slug from centers where slug = 'sunshine';   -- 마케팅 페이지 진입
-- select * from get_my_patients();                              -- 보호자 본인 어르신
-- select * from notifications where recipient_id = auth.uid()
--   order by created_at desc limit 20;                          -- 내 알림함
