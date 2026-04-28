-- ================================================================
-- CareOn Schema v9 — 보호사 급여 정보 + 변경 요청 플로우
-- 1) workers 테이블에 hourly_rate / salary_type 추가
-- 2) get_my_monthly_stats() RPC: 본인 이번달 통계 (보호사 앱)
-- 3) salary_inquiries 테이블: 보호사 → 센터장 변경 요청
-- ================================================================

-- ── 1. workers 급여 관련 컬럼 ────────────────────────────────────
alter table public.workers add column if not exists hourly_rate integer default 12000;       -- 시급(원)
alter table public.workers add column if not exists per_visit_rate integer;                   -- 방문당(선택)
alter table public.workers add column if not exists salary_type text not null default 'hourly'; -- hourly | per_visit | monthly

comment on column public.workers.hourly_rate is '시급(원). 정부 수가 기준으로 약 12,000원';
comment on column public.workers.salary_type is 'hourly: 시간×시급 / per_visit: 방문×건당 / monthly: 월급(base_salary)';

-- ── 2. 보호사 본인 이번달 통계 RPC ───────────────────────────────
create or replace function public.get_my_monthly_stats(p_month text default to_char(now(),'YYYY-MM'))
returns json language plpgsql security definer stable as $$
declare
  v_worker record;
  v_visit_count int;
  v_completed_count int;
  v_total_minutes int;
  v_estimated_salary int;
begin
  -- 본인 worker 정보
  select w.* into v_worker
  from public.workers w where w.profile_id = auth.uid();
  if v_worker is null then
    return json_build_object('error', '보호사 정보를 찾을 수 없습니다');
  end if;

  -- 이번달 visits 통계
  select
    count(*),
    count(*) filter (where status = 'completed'),
    coalesce(sum(case when start_time is not null and end_time is not null
      then extract(epoch from (end_time - start_time))/60
      else 90 end) filter (where status = 'completed'), 0)::int
  into v_visit_count, v_completed_count, v_total_minutes
  from public.visits
  where worker_id = v_worker.id
    and to_char(scheduled_date, 'YYYY-MM') = p_month;

  -- 예상 급여 계산
  v_estimated_salary := case v_worker.salary_type
    when 'hourly'    then ((v_total_minutes::float / 60) * coalesce(v_worker.hourly_rate, 12000))::int
    when 'per_visit' then v_completed_count * coalesce(v_worker.per_visit_rate, 30000)
    when 'monthly'   then coalesce(v_worker.base_salary, 0)
    else 0
  end;

  return json_build_object(
    'month', p_month,
    'worker_id', v_worker.id,
    'worker_name', v_worker.name,
    'salary_type', v_worker.salary_type,
    'hourly_rate', v_worker.hourly_rate,
    'per_visit_rate', v_worker.per_visit_rate,
    'base_salary', v_worker.base_salary,
    'visit_count', v_visit_count,
    'completed_count', v_completed_count,
    'total_minutes', v_total_minutes,
    'total_hours', round(v_total_minutes::numeric / 60, 1),
    'estimated_salary', v_estimated_salary
  );
end;
$$;

-- ── 3. salary_inquiries 테이블 (변경 요청) ───────────────────────
create table if not exists public.salary_inquiries (
  id           uuid primary key default gen_random_uuid(),
  worker_id    uuid not null references public.workers(id) on delete cascade,
  center_id    uuid not null references public.centers(id) on delete cascade,
  month_year   text not null,           -- 'YYYY-MM' (대상 월)
  message      text not null,            -- 보호사가 작성한 변경 요청 내용
  status       text not null default 'open',  -- open | resolved | rejected
  response     text,                     -- 센터장의 응답
  responded_at timestamptz,
  responded_by uuid references auth.users(id),
  created_at   timestamptz not null default now()
);
alter table public.salary_inquiries enable row level security;

create index if not exists salary_inq_center_idx on public.salary_inquiries(center_id, status, created_at desc);
create index if not exists salary_inq_worker_idx on public.salary_inquiries(worker_id, created_at desc);

-- 보호사: 본인 inquiry만 조회/생성
create policy "salary_inq_worker_self" on public.salary_inquiries
  for select using (
    worker_id in (select id from public.workers where profile_id = auth.uid())
    or center_id = public.get_my_center_id()
    or public.get_my_role() = 'superadmin'
  );
create policy "salary_inq_worker_insert" on public.salary_inquiries
  for insert with check (
    worker_id in (select id from public.workers where profile_id = auth.uid())
  );
-- 센터장: 응답 (UPDATE)
create policy "salary_inq_admin_update" on public.salary_inquiries
  for update using (center_id = public.get_my_center_id());

-- ── 4. 보호사가 변경 요청 보내는 RPC ─────────────────────────────
create or replace function public.submit_salary_inquiry(
  p_month_year text,
  p_message text
) returns json language plpgsql security definer as $$
declare
  v_worker record;
  v_inquiry_id uuid;
begin
  if length(trim(coalesce(p_message,''))) < 5 then
    return json_build_object('success', false, 'error', '변경 요청 내용을 5자 이상 입력해주세요');
  end if;

  select w.* into v_worker
  from public.workers w where w.profile_id = auth.uid();
  if v_worker is null then
    return json_build_object('success', false, 'error', '보호사 정보를 찾을 수 없습니다');
  end if;

  -- 24시간 내 동일 월 중복 요청 방지
  if exists (
    select 1 from public.salary_inquiries
    where worker_id = v_worker.id
      and month_year = p_month_year
      and status = 'open'
      and created_at > now() - interval '24 hours'
  ) then
    return json_build_object('success', false, 'error', '같은 달의 미해결 요청이 이미 있습니다');
  end if;

  insert into public.salary_inquiries (worker_id, center_id, month_year, message)
  values (v_worker.id, v_worker.center_id, p_month_year, trim(p_message))
  returning id into v_inquiry_id;

  return json_build_object('success', true, 'inquiry_id', v_inquiry_id);
end;
$$;

-- ── 5. 센터장: 미해결 inquiry 카운트 (대시보드 알림용) ───────────
create or replace function public.get_open_inquiry_count()
returns integer language sql security definer stable as $$
  select count(*)::integer from public.salary_inquiries
  where center_id = public.get_my_center_id() and status = 'open'
$$;
