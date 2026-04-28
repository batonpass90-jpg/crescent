-- ================================================================
-- CareOn Schema v8 — 알림 정책 재설계 (수시 → 일일 보고서)
-- 1) notification_settings 테이블 (보호자별 알림 ON/OFF + 시각)
-- 2) get_daily_report_recipients() 함수 (Edge Function이 호출)
-- 3) pg_cron job: 매일 19:00 KST = 10:00 UTC에 send-daily-report 트리거
-- ================================================================

-- ── 0. 의존 컬럼 안전장치 (이전 schema 부분 실행 케이스 대응) ───
alter table public.visits add column if not exists care_log text;
alter table public.visits add column if not exists photos jsonb default '[]'::jsonb;

-- ── 1. notification_settings 테이블 ──────────────────────────────
create table if not exists public.notification_settings (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  visit_start_alert    boolean not null default true,   -- 보호사 도착 시 알림 (가족 안심)
  daily_report         boolean not null default true,   -- 일일 종합 보고서
  daily_report_time    time not null default '19:00',   -- KST 기준
  channel_preference   text not null default 'auto',    -- auto | push | sms (auto = 폴백 체인)
  updated_at           timestamptz not null default now()
);
alter table public.notification_settings enable row level security;

create policy "notif_settings_self" on public.notification_settings
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 신규 보호자 가입 시 default settings 자동 생성
create or replace function public.ensure_notification_settings()
returns trigger language plpgsql security definer as $$
begin
  if new.role = 'guardian' then
    insert into public.notification_settings (user_id) values (new.id)
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;
drop trigger if exists trg_ensure_notif_settings on public.profiles;
create trigger trg_ensure_notif_settings
  after insert or update of role on public.profiles
  for each row execute function public.ensure_notification_settings();

-- ── 2. 일일 보고서 발송 대상 조회 함수 ───────────────────────────
-- 그날 케어가 있었던 어르신의 보호자 목록 + 케어 요약
create or replace function public.get_daily_report_data(p_date date default current_date)
returns table (
  guardian_id      uuid,
  guardian_phone   text,
  guardian_name    text,
  patient_name     text,
  patient_id       uuid,
  center_id        uuid,
  center_name      text,
  visit_count      bigint,
  completed_count  bigint,
  total_checks     bigint,
  done_checks      bigint,
  worker_names     text,
  has_photos       boolean,
  memos            text
)
language sql security definer stable as $$
  select
    g.id                                                       as guardian_id,
    g.phone                                                    as guardian_phone,
    g.name                                                     as guardian_name,
    p.name                                                     as patient_name,
    p.id                                                       as patient_id,
    c.id                                                       as center_id,
    c.name                                                     as center_name,
    count(v.id)                                                as visit_count,
    count(*) filter (where v.status = 'completed')             as completed_count,
    -- 체크리스트 5종 × 완료된 visit 수 = 총 체크 가능 수
    count(*) filter (where v.status = 'completed') * 5         as total_checks,
    -- 실제 완료한 체크 수 (care_log가 빈 문자열/NULL이어도 안전하게)
    coalesce(sum(case when v.status = 'completed' then
      (select count(*) from jsonb_each(
         coalesce(
           nullif(v.care_log, '')::jsonb->'checks',
           '{}'::jsonb
         )
      ) e
       where (e.value->>'done')::boolean is true)
    else 0 end), 0)                                            as done_checks,
    string_agg(distinct w.name, ', ')                          as worker_names,
    bool_or(jsonb_array_length(coalesce(v.photos, '[]'::jsonb)) > 0) as has_photos,
    string_agg(distinct nullif(coalesce(nullif(v.care_log,'')::jsonb,'{}'::jsonb)->>'memo', ''), ' / ') as memos
  from public.patient_guardians pg
  join public.profiles g on g.id = pg.guardian_id
  join public.patients p on p.id = pg.patient_id
  join public.centers c on c.id = p.center_id
  left join public.visits v on v.patient_id = p.id and v.scheduled_date = p_date
  left join public.workers w on w.id = v.worker_id
  join public.notification_settings ns on ns.user_id = g.id
  where pg.notify_enabled = true
    and ns.daily_report = true
    and v.id is not null  -- 그날 방문이 있었던 경우만
  group by g.id, g.phone, g.name, p.id, p.name, c.id, c.name
  having count(*) filter (where v.status = 'completed') > 0;
$$;

-- ── 3. pg_cron 설치 + job 등록 ───────────────────────────────────
-- pg_cron이 활성화되어 있어야 함 (Dashboard → Database → Extensions → pg_cron)
-- 매일 19:00 KST = 10:00 UTC

do $$ begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise notice 'pg_cron extension이 활성화되지 않았습니다. Dashboard → Database → Extensions에서 pg_cron을 활성화해주세요.';
  end if;
end $$;

-- 기존 job 제거 후 재등록 (idempotent)
do $$ begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('careon-daily-report') where exists (select 1 from cron.job where jobname = 'careon-daily-report');

    perform cron.schedule(
      'careon-daily-report',
      '0 10 * * *',   -- UTC 기준 매일 10:00 = KST 19:00
      $cron$
        select net.http_post(
          url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/send-daily-report',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
          ),
          body := jsonb_build_object('date', current_date::text)
        );
      $cron$
    );
  end if;
exception when others then
  raise notice 'pg_cron job 등록 실패: %. Dashboard에서 수동 등록 필요.', SQLERRM;
end $$;

-- ────────────────────────────────────────────────────────────────
-- 📌 pg_cron 수동 등록 (위 자동 등록이 실패한 경우)
-- ────────────────────────────────────────────────────────────────
-- Supabase Dashboard → Database → Extensions에서 pg_cron 활성화 후
-- SQL Editor에서 아래 실행:
--
-- select cron.schedule(
--   'careon-daily-report',
--   '0 10 * * *',
--   $$ select net.http_post(
--        url := 'https://swsemxzgzcwwrhowuaqz.supabase.co/functions/v1/send-daily-report',
--        headers := jsonb_build_object(
--          'Content-Type', 'application/json',
--          'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
--        ),
--        body := jsonb_build_object('date', current_date::text)
--      );
--   $$
-- );
-- ────────────────────────────────────────────────────────────────
