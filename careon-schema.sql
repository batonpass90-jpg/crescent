-- ================================================================
-- CareOn · 방문요양 SaaS — Supabase Schema (멀티테넌트 RLS 포함)
-- Supabase SQL Editor에서 전체 실행하세요
-- ================================================================

-- ── 0. 보안 헬퍼 함수 (RLS 내부 재귀 방지용) ──────────────────────
-- security definer = 함수 내부에서 RLS 우회 (작성자 권한으로 실행)
-- stable = 같은 트랜잭션 내 결과 캐시 → 성능 최적화

create or replace function public.get_my_center_id()
returns uuid language sql security definer stable as $$
  select center_id from public.profiles where id = auth.uid()
$$;

create or replace function public.get_my_role()
returns text language sql security definer stable as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ── 1. centers (센터) ────────────────────────────────────────────
create table if not exists public.centers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  owner_id      uuid references auth.users(id) on delete set null,
  phone         text,
  address       text,
  plan          text not null default 'basic',  -- basic | standard | plus | premium | enterprise
  sms_extra_quota integer not null default 0,
  primary_color text default '#0D9488',
  created_at    timestamptz not null default now()
);
-- 기존 테이블이 컬럼 없이 만들어진 경우를 위한 안전장치 (idempotent)
alter table public.centers add column if not exists plan text not null default 'basic';
-- pro → plus 마이그레이션 (구 정책에서 신 정책으로)
update public.centers set plan = 'plus' where plan = 'pro';
-- 신 정책 CHECK 제약 (basic | standard | plus | premium | enterprise)
alter table public.centers drop constraint if exists centers_plan_check;
alter table public.centers add constraint centers_plan_check
  check (plan in ('basic','standard','plus','premium','enterprise'));
alter table public.centers add column if not exists sms_extra_quota integer not null default 0;
alter table public.centers add column if not exists primary_color text default '#0D9488';
alter table public.centers add column if not exists phone text;
alter table public.centers add column if not exists address text;
alter table public.centers enable row level security;

-- 센터는 본인 소유 센터 또는 소속 센터만 조회
create policy "centers_select" on public.centers
  for select using (
    owner_id = auth.uid()
    or id = public.get_my_center_id()
    or public.get_my_role() = 'superadmin'
  );
-- 센터 정보 수정: 소유자 또는 슈퍼어드민만
create policy "centers_update" on public.centers
  for update using (
    owner_id = auth.uid()
    or public.get_my_role() = 'superadmin'
  );
-- 센터 생성: 가입 시 자기 자신의 센터 생성 허용
create policy "centers_insert" on public.centers
  for insert with check (
    owner_id = auth.uid()
    or public.get_my_role() = 'superadmin'
  );

-- ── 2. profiles (사용자 프로필) ───────────────────────────────────
-- role: 'admin'(센터장) | 'worker'(보호사) | 'guardian'(보호자) | 'superadmin'
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  phone      text,
  role       text not null default 'admin',
  center_id  uuid references public.centers(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists role text not null default 'admin';
alter table public.profiles add column if not exists center_id uuid references public.centers(id) on delete set null;

-- role 허용 값: 4가지로 제한 (idempotent)
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('admin', 'worker', 'guardian', 'superadmin'));

alter table public.profiles enable row level security;

-- 자기 자신 + 같은 센터 구성원 + 슈퍼어드민
create policy "profiles_select" on public.profiles
  for select using (
    id = auth.uid()
    or center_id = public.get_my_center_id()
    or public.get_my_role() = 'superadmin'
  );
-- 본인 프로필만 수정
create policy "profiles_update" on public.profiles
  for update using (id = auth.uid());
-- 가입 시 자기 자신만 insert
create policy "profiles_insert" on public.profiles
  for insert with check (id = auth.uid());

-- ── 3. patients (수급자) ──────────────────────────────────────────
create table if not exists public.patients (
  id             uuid primary key default gen_random_uuid(),
  center_id      uuid not null references public.centers(id) on delete cascade,
  name           text not null,
  birth_date     date,
  phone          text,
  guardian_name  text,
  guardian_phone text,
  address        text,
  care_grade     text,                       -- 1~5등급
  status         text not null default 'active',  -- active | inactive
  note           text,
  created_at     timestamptz not null default now()
);
-- 기존 테이블 호환 (idempotent ALTER)
alter table public.patients add column if not exists center_id uuid references public.centers(id) on delete cascade;
alter table public.patients add column if not exists birth_date date;
alter table public.patients add column if not exists phone text;
alter table public.patients add column if not exists guardian_name text;
alter table public.patients add column if not exists guardian_phone text;
alter table public.patients add column if not exists address text;
alter table public.patients add column if not exists care_grade text;
alter table public.patients add column if not exists status text not null default 'active';
alter table public.patients add column if not exists note text;
alter table public.patients enable row level security;

-- 핵심 격리: 반드시 같은 center_id만 접근
create policy "patients_select" on public.patients
  for select using (
    center_id = public.get_my_center_id()
    or public.get_my_role() = 'superadmin'
  );
create policy "patients_insert" on public.patients
  for insert with check (center_id = public.get_my_center_id());
create policy "patients_update" on public.patients
  for update using (center_id = public.get_my_center_id());
create policy "patients_delete" on public.patients
  for delete using (center_id = public.get_my_center_id());

-- ── 4. workers (보호사) ───────────────────────────────────────────
create table if not exists public.workers (
  id          uuid primary key default gen_random_uuid(),
  center_id   uuid not null references public.centers(id) on delete cascade,
  profile_id  uuid references public.profiles(id) on delete set null,
  name        text not null,
  phone       text,
  birth_date  date,
  hire_date   date,
  status      text not null default 'active',  -- active | inactive
  specialty   text,
  base_salary integer,
  created_at  timestamptz not null default now()
);
-- 기존 테이블 호환 (idempotent ALTER)
alter table public.workers add column if not exists center_id uuid references public.centers(id) on delete cascade;
alter table public.workers add column if not exists profile_id uuid references public.profiles(id) on delete set null;
alter table public.workers add column if not exists phone text;
alter table public.workers add column if not exists birth_date date;
alter table public.workers add column if not exists hire_date date;
alter table public.workers add column if not exists status text not null default 'active';
alter table public.workers add column if not exists specialty text;
alter table public.workers add column if not exists base_salary integer;
alter table public.workers enable row level security;

create policy "workers_select" on public.workers
  for select using (
    center_id = public.get_my_center_id()
    or public.get_my_role() = 'superadmin'
  );
create policy "workers_insert" on public.workers
  for insert with check (center_id = public.get_my_center_id());
create policy "workers_update" on public.workers
  for update using (center_id = public.get_my_center_id());
create policy "workers_delete" on public.workers
  for delete using (center_id = public.get_my_center_id());

-- ── 5. visits (방문 기록 / 케어일지) ─────────────────────────────
create table if not exists public.visits (
  id             uuid primary key default gen_random_uuid(),
  center_id      uuid not null references public.centers(id) on delete cascade,
  worker_id      uuid references public.workers(id) on delete set null,
  patient_id     uuid references public.patients(id) on delete cascade,
  scheduled_date date not null,
  start_time     time,
  end_time       time,
  status         text not null default 'scheduled',  -- scheduled | in_progress | completed | cancelled
  care_log       text,
  gps_checkin_lat  numeric(9,6),
  gps_checkin_lng  numeric(9,6),
  gps_checkout_lat numeric(9,6),
  gps_checkout_lng numeric(9,6),
  created_at     timestamptz not null default now()
);
-- 기존 테이블 호환 (idempotent ALTER)
alter table public.visits add column if not exists center_id uuid references public.centers(id) on delete cascade;
alter table public.visits add column if not exists worker_id uuid references public.workers(id) on delete set null;
alter table public.visits add column if not exists patient_id uuid references public.patients(id) on delete cascade;
alter table public.visits add column if not exists start_time time;
alter table public.visits add column if not exists end_time time;
alter table public.visits add column if not exists status text not null default 'scheduled';
alter table public.visits add column if not exists care_log text;
alter table public.visits add column if not exists gps_checkin_lat numeric(9,6);
alter table public.visits add column if not exists gps_checkin_lng numeric(9,6);
alter table public.visits add column if not exists gps_checkout_lat numeric(9,6);
alter table public.visits add column if not exists gps_checkout_lng numeric(9,6);
alter table public.visits enable row level security;

create policy "visits_select" on public.visits
  for select using (
    center_id = public.get_my_center_id()
    or public.get_my_role() = 'superadmin'
  );
create policy "visits_insert" on public.visits
  for insert with check (center_id = public.get_my_center_id());
create policy "visits_update" on public.visits
  for update using (center_id = public.get_my_center_id());
create policy "visits_delete" on public.visits
  for delete using (center_id = public.get_my_center_id());

-- ── 6. sms_logs (문자 발송 기록) ─────────────────────────────────
create table if not exists public.sms_logs (
  id              uuid primary key default gen_random_uuid(),
  center_id       uuid not null references public.centers(id) on delete cascade,
  sender_id       uuid references auth.users(id) on delete set null,
  recipient_phone text not null,
  recipient_name  text,
  message         text not null,
  type            text not null default 'sms',   -- sms | lms
  status          text not null default 'sent',  -- sent | failed
  sent_at         timestamptz not null default now()
);
alter table public.sms_logs enable row level security;

-- 인덱스: 월별 사용량 집계 (sent_at 정렬 / 범위 검색용)
-- date_trunc는 STABLE이라 인덱스에 직접 못 쓰므로 raw timestamptz 사용
create index if not exists sms_logs_center_sent_at
  on public.sms_logs (center_id, sent_at desc);

create policy "sms_logs_select" on public.sms_logs
  for select using (
    center_id = public.get_my_center_id()
    or public.get_my_role() = 'superadmin'
  );
create policy "sms_logs_insert" on public.sms_logs
  for insert with check (center_id = public.get_my_center_id());
-- 발송 로그는 수정/삭제 불가 (감사 추적)

-- ── 7. unpaid_fees (미납금) ───────────────────────────────────────
create table if not exists public.unpaid_fees (
  id          uuid primary key default gen_random_uuid(),
  center_id   uuid not null references public.centers(id) on delete cascade,
  patient_id  uuid references public.patients(id) on delete cascade,
  amount      integer not null,
  description text,
  due_date    date,
  status      text not null default 'unpaid',  -- unpaid | paid | waived
  paid_at     timestamptz,
  created_at  timestamptz not null default now()
);
alter table public.unpaid_fees enable row level security;

create policy "unpaid_fees_select" on public.unpaid_fees
  for select using (
    center_id = public.get_my_center_id()
    or public.get_my_role() = 'superadmin'
  );
create policy "unpaid_fees_insert" on public.unpaid_fees
  for insert with check (center_id = public.get_my_center_id());
create policy "unpaid_fees_update" on public.unpaid_fees
  for update using (center_id = public.get_my_center_id());
create policy "unpaid_fees_delete" on public.unpaid_fees
  for delete using (center_id = public.get_my_center_id());

-- ── 8. 슈퍼어드민용 센터 현황 뷰 ──────────────────────────────────
-- RLS는 뷰에는 적용되지 않으므로, 슈퍼어드민이 service_role 또는
-- get_my_role() = 'superadmin' 조건을 만족할 때만 사용
create or replace view public.center_stats as
  select
    c.id,
    c.name,
    c.plan,
    c.sms_extra_quota,
    c.created_at,
    (select count(*) from public.patients p where p.center_id = c.id and p.status = 'active')   as patient_count,
    (select count(*) from public.workers  w where w.center_id = c.id and w.status = 'active')    as worker_count,
    (select count(*) from public.sms_logs s
      where s.center_id = c.id
        and date_trunc('month', s.sent_at) = date_trunc('month', now()))                          as sms_used_this_month,
    (select name from public.profiles pr where pr.id = c.owner_id)                               as owner_name,
    (select phone from public.profiles pr where pr.id = c.owner_id)                              as owner_phone
  from public.centers c;

-- ── 9. 티어 자동 업그레이드 체크 함수 ────────────────────────────
-- 수급자 수가 현재 티어 초과 시 다음 달 1일 자동 상위 티어 예약 (알림 포함)
-- 실제 알림 발송은 Edge Function에서 처리 권장
create or replace function public.check_tier_upgrade()
returns void language plpgsql security definer as $$
declare
  rec record;
  patient_cnt integer;
  next_plan text;
begin
  for rec in select id, plan from public.centers loop
    select count(*) into patient_cnt
    from public.patients
    where center_id = rec.id and status = 'active';

    -- Enterprise는 자동 승격 대상 아님 (커스텀 제작 고객 전용)
    next_plan := case
      when rec.plan = 'enterprise' then null
      when patient_cnt >= 61 and rec.plan != 'premium' then 'premium'
      when patient_cnt >= 31 and rec.plan in ('basic','standard') and patient_cnt <= 60 then 'plus'
      when patient_cnt >= 11 and rec.plan = 'basic' and patient_cnt <= 30 then 'standard'
      else null
    end;

    if next_plan is not null then
      -- 실제 업그레이드는 다음 달 1일 적용 (pg_cron으로 스케줄 권장)
      -- 여기서는 로그 기록 역할만 수행
      raise notice 'Center % needs upgrade to % (patients: %)', rec.id, next_plan, patient_cnt;
    end if;
  end loop;
end;
$$;

-- ── 10. 월별 SMS 사용량 조회 함수 ────────────────────────────────
create or replace function public.get_sms_usage(p_center_id uuid, p_month text default to_char(now(),'YYYY-MM'))
returns integer language sql security definer stable as $$
  select count(*)::integer
  from public.sms_logs
  where center_id = p_center_id
    and to_char(sent_at, 'YYYY-MM') = p_month
    and status = 'sent'
$$;

-- ================================================================
-- ✅ RLS 격리 검증 쿼리 (슈퍼어드민 콘솔에서 실행)
-- ================================================================
-- 아래 쿼리들로 격리가 올바른지 확인:
--
-- 1) 특정 사용자로 접속 시 본인 센터 데이터만 보이는지:
--    set request.jwt.claims = '{"sub":"<user-uuid>"}';
--    select * from patients;   -- 본인 center_id 것만 나와야 함
--
-- 2) 다른 센터 UUID로 insert 시도:
--    insert into patients (center_id, name) values ('<other-center-id>', '테스트');
--    -- ERROR: new row violates row-level security policy 가 나와야 함
-- ================================================================
