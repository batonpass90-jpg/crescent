-- ================================================================
-- CareOn 스키마 v10 — DB 사업 모델 전환
--
-- 적용 방법:
--   Supabase Dashboard → SQL Editor → 본 파일 전체 복사·실행
--
-- 변경 요약:
--   1. centers 테이블 확장 (slug, 홈페이지 정보, 충전금)
--   2. leads 테이블 신규 (보호자 진단 결과 + 연락처)
--   3. credit_transactions 테이블 신규 (충전·차감 이력)
--   4. submit_lead RPC (트랜잭션 처리: 잔액 검증 → 차감 → leads insert)
--   5. RLS 정책: 센터장은 본인 센터 leads만, 슈퍼어드민은 전체
-- ================================================================

-- ============================================================
-- 1. centers 확장
-- ============================================================
alter table public.centers
  add column if not exists slug              text,
  add column if not exists logo_url          text,
  add column if not exists hero_image_url    text,
  add column if not exists greeting          text,
  add column if not exists site_published    boolean not null default false,
  add column if not exists credit_balance    integer not null default 0,
  add column if not exists lead_unit_price   integer not null default 5000,
  add column if not exists alert_phone       text,
  add column if not exists alert_email       text;

-- slug 유니크 제약
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'centers_slug_unique'
  ) then
    alter table public.centers add constraint centers_slug_unique unique (slug);
  end if;
end $$;

create index if not exists idx_centers_slug on public.centers(slug);

-- ============================================================
-- 2. leads 테이블 신규
-- ============================================================
create table if not exists public.leads (
  id                  uuid primary key default gen_random_uuid(),
  center_id           uuid not null references public.centers(id) on delete cascade,

  -- 진단 결과 요약
  predicted_grade     text,
  predicted_score     integer,
  predicted_cost_min  integer,
  predicted_cost_max  integer,
  patient_age         integer,
  patient_summary     text,
  has_dementia        boolean default false,
  has_stroke          boolean default false,
  has_parkinson       boolean default false,
  has_arthritis       boolean default false,
  medical_need        boolean default false,
  insurance_rate      numeric(4,3),

  -- 보호자 연락처 (개인정보)
  parent_name         text,
  parent_phone        text,
  preferred_time      text,
  consent_at          timestamptz,

  -- 원본 답변 (JSON)
  raw_answers         jsonb,
  raw_result          jsonb,

  -- 상태 관리
  method              text not null default 'form' check (method in ('form','call')),
  status              text not null default 'new'
    check (status in ('new','contacted','consulted','contracted','refunded','spam')),
  notes               text,

  -- 과금 추적
  charged             boolean not null default false,
  charged_amount      integer,
  refunded_at         timestamptz,
  refund_reason       text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_leads_center_id  on public.leads(center_id);
create index if not exists idx_leads_status     on public.leads(status);
create index if not exists idx_leads_created_at on public.leads(created_at desc);

-- updated_at 자동 갱신
create or replace function public.tg_leads_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at
  before update on public.leads
  for each row execute function public.tg_leads_updated_at();

-- ============================================================
-- 3. credit_transactions 테이블 신규
-- ============================================================
create table if not exists public.credit_transactions (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references public.centers(id) on delete cascade,
  amount        integer not null,                 -- 양수=충전 / 음수=차감
  balance_after integer not null,                 -- 거래 후 잔액
  reason        text not null check (reason in (
                  'topup','lead_charge','refund','admin_adjustment','signup_bonus'
                )),
  lead_id       uuid references public.leads(id) on delete set null,
  memo          text,
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now()
);

create index if not exists idx_credit_tx_center_id  on public.credit_transactions(center_id);
create index if not exists idx_credit_tx_created_at on public.credit_transactions(created_at desc);

-- ============================================================
-- 4. submit_lead RPC (트랜잭션)
-- ============================================================
create or replace function public.submit_lead(
  p_center_slug      text,
  p_parent_name      text,
  p_parent_phone     text,
  p_preferred_time   text,
  p_predicted_grade  text,
  p_predicted_score  integer,
  p_cost_min         integer,
  p_cost_max         integer,
  p_patient_summary  text,
  p_has_dementia     boolean,
  p_has_stroke       boolean,
  p_has_parkinson    boolean,
  p_has_arthritis    boolean,
  p_medical_need     boolean,
  p_insurance_rate   numeric,
  p_method           text,
  p_raw_answers      jsonb,
  p_raw_result       jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_center        record;
  v_lead_id       uuid;
  v_unit_price    integer;
  v_new_balance   integer;
begin
  -- 센터 조회
  select * into v_center from public.centers where slug = p_center_slug and site_published = true;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'center_not_found');
  end if;

  v_unit_price := coalesce(v_center.lead_unit_price, 5000);

  -- 잔액 확인 (방식 무관 모두 차감)
  if v_center.credit_balance < v_unit_price then
    return jsonb_build_object('ok', false, 'error', 'insufficient_credit', 'balance', v_center.credit_balance);
  end if;

  -- leads insert
  insert into public.leads (
    center_id, predicted_grade, predicted_score,
    predicted_cost_min, predicted_cost_max,
    patient_summary, has_dementia, has_stroke, has_parkinson, has_arthritis,
    medical_need, insurance_rate,
    parent_name, parent_phone, preferred_time, consent_at,
    raw_answers, raw_result, method,
    charged, charged_amount, status
  ) values (
    v_center.id, p_predicted_grade, p_predicted_score,
    p_cost_min, p_cost_max,
    p_patient_summary, coalesce(p_has_dementia,false), coalesce(p_has_stroke,false),
    coalesce(p_has_parkinson,false), coalesce(p_has_arthritis,false),
    coalesce(p_medical_need,false), p_insurance_rate,
    p_parent_name, p_parent_phone, p_preferred_time, now(),
    p_raw_answers, p_raw_result, coalesce(p_method,'form'),
    true, v_unit_price, 'new'
  ) returning id into v_lead_id;

  -- 충전금 차감
  v_new_balance := v_center.credit_balance - v_unit_price;
  update public.centers set credit_balance = v_new_balance where id = v_center.id;

  -- 거래 이력
  insert into public.credit_transactions (
    center_id, amount, balance_after, reason, lead_id, memo
  ) values (
    v_center.id, -v_unit_price, v_new_balance, 'lead_charge', v_lead_id,
    '보호자 진단 DB 자동 차감 — ' || coalesce(p_parent_name,'(이름없음)')
  );

  return jsonb_build_object(
    'ok', true,
    'lead_id', v_lead_id,
    'center_id', v_center.id,
    'center_name', v_center.name,
    'center_alert_phone', v_center.alert_phone,
    'center_alert_email', v_center.alert_email,
    'charged', v_unit_price,
    'balance_after', v_new_balance
  );
end;
$$;

grant execute on function public.submit_lead(text,text,text,text,text,integer,integer,integer,text,boolean,boolean,boolean,boolean,boolean,numeric,text,jsonb,jsonb) to anon, authenticated;

-- ============================================================
-- 5. topup_credit RPC (슈퍼어드민 충전)
-- ============================================================
create or replace function public.topup_credit(
  p_center_id  uuid,
  p_amount     integer,
  p_memo       text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_center      record;
  v_new_balance integer;
  v_user_id     uuid := auth.uid();
  v_role        text;
begin
  -- 슈퍼어드민만 허용
  select role into v_role from public.profiles where id = v_user_id;
  if v_role <> 'superadmin' then
    return jsonb_build_object('ok', false, 'error', 'not_authorized');
  end if;

  if p_amount <= 0 then
    return jsonb_build_object('ok', false, 'error', 'invalid_amount');
  end if;

  select * into v_center from public.centers where id = p_center_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'center_not_found');
  end if;

  v_new_balance := v_center.credit_balance + p_amount;
  update public.centers set credit_balance = v_new_balance where id = p_center_id;

  insert into public.credit_transactions (
    center_id, amount, balance_after, reason, memo, created_by
  ) values (
    p_center_id, p_amount, v_new_balance, 'topup', p_memo, v_user_id
  );

  return jsonb_build_object('ok', true, 'balance_after', v_new_balance);
end;
$$;

grant execute on function public.topup_credit(uuid,integer,text) to authenticated;

-- ============================================================
-- 6. refund_lead RPC (센터장 환불 요청 → 슈퍼어드민 승인)
-- ============================================================
create or replace function public.refund_lead(
  p_lead_id  uuid,
  p_reason   text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead        record;
  v_user_id     uuid := auth.uid();
  v_role        text;
  v_new_balance integer;
begin
  select role into v_role from public.profiles where id = v_user_id;
  if v_role <> 'superadmin' then
    return jsonb_build_object('ok', false, 'error', 'not_authorized');
  end if;

  select * into v_lead from public.leads where id = p_lead_id for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'lead_not_found'); end if;
  if not v_lead.charged then return jsonb_build_object('ok', false, 'error', 'not_charged'); end if;
  if v_lead.refunded_at is not null then return jsonb_build_object('ok', false, 'error', 'already_refunded'); end if;

  -- 환불
  update public.leads set
    status = 'refunded',
    refunded_at = now(),
    refund_reason = p_reason
  where id = p_lead_id;

  update public.centers set credit_balance = credit_balance + v_lead.charged_amount
    where id = v_lead.center_id
    returning credit_balance into v_new_balance;

  insert into public.credit_transactions (
    center_id, amount, balance_after, reason, lead_id, memo, created_by
  ) values (
    v_lead.center_id, v_lead.charged_amount, v_new_balance, 'refund', p_lead_id,
    '환불: ' || coalesce(p_reason, ''), v_user_id
  );

  return jsonb_build_object('ok', true, 'refunded', v_lead.charged_amount);
end;
$$;

grant execute on function public.refund_lead(uuid,text) to authenticated;

-- ============================================================
-- 7. RLS 정책
-- ============================================================
alter table public.leads enable row level security;
alter table public.credit_transactions enable row level security;

-- 센터장: 본인 센터 leads만 조회·수정
drop policy if exists leads_select_own on public.leads;
create policy leads_select_own on public.leads for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (
        p.center_id = leads.center_id or p.role = 'superadmin'
      )
    )
  );

drop policy if exists leads_update_own on public.leads;
create policy leads_update_own on public.leads for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (
        (p.center_id = leads.center_id and p.role = 'admin') or p.role = 'superadmin'
      )
    )
  );

-- credit_transactions: 본인 센터 + 슈퍼어드민
drop policy if exists credit_tx_select_own on public.credit_transactions;
create policy credit_tx_select_own on public.credit_transactions for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (
        p.center_id = credit_transactions.center_id or p.role = 'superadmin'
      )
    )
  );

-- ============================================================
-- 8. 확인 메시지
-- ============================================================
do $$
begin
  raise notice '✅ CareOn v10 스키마 적용 완료';
  raise notice '   - centers 확장: slug, logo_url, credit_balance 등';
  raise notice '   - leads / credit_transactions 테이블 신규';
  raise notice '   - submit_lead / topup_credit / refund_lead RPC';
  raise notice '   - RLS: 센터장(본인 센터만) / 슈퍼어드민(전체)';
end $$;
