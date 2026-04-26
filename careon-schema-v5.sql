-- ================================================================
-- CareOn Schema v5 — 토스페이먼츠 SMS 충전 결제 추적
-- 1) sms_purchases 테이블 (주문/결제 이력)
-- 2) add_sms_quota() RPC (결제 검증 후 quota 증가, Edge Function이 호출)
-- ================================================================

create table if not exists public.sms_purchases (
  id              uuid primary key default gen_random_uuid(),
  order_id        text not null unique,           -- 토스 주문번호 (UUID)
  payment_key     text,                            -- 토스 paymentKey (결제 완료 후 채움)
  center_id       uuid not null references public.centers(id) on delete cascade,
  buyer_id        uuid references auth.users(id) on delete set null,
  sms_type        text not null,                   -- 'sms' | 'lms'
  count           integer not null,                -- 충전 건수
  unit_price      integer not null,                -- 건당 단가 (원)
  amount          integer not null,                -- 결제 금액 (원)
  status          text not null default 'pending', -- pending | paid | failed | cancelled
  toss_response   jsonb,                           -- 토스 confirm API 응답 전체
  paid_at         timestamptz,
  failed_reason   text,
  created_at      timestamptz not null default now()
);
alter table public.sms_purchases enable row level security;

create index if not exists sms_purchases_center_idx on public.sms_purchases (center_id, created_at desc);
create index if not exists sms_purchases_order_idx  on public.sms_purchases (order_id);

-- 본인 센터 결제 내역만 조회 가능
create policy "sms_purchases_select" on public.sms_purchases
  for select using (
    center_id = public.get_my_center_id()
    or public.get_my_role() = 'superadmin'
  );

-- 결제 시작 시 본인이 INSERT (pending 상태로)
create policy "sms_purchases_insert" on public.sms_purchases
  for insert with check (
    center_id = public.get_my_center_id()
    and buyer_id = auth.uid()
  );

-- UPDATE는 Edge Function (service_role)이 담당 → 별도 정책 불필요

-- ── SMS quota 증가 함수 (Edge Function에서 호출) ─────────────────
-- 검증된 결제만 quota 증가 + 중복 방지
create or replace function public.add_sms_quota(
  p_order_id    text,
  p_payment_key text,
  p_toss_data   jsonb
)
returns json language plpgsql security definer as $$
declare
  purchase  record;
begin
  -- 주문 조회
  select * into purchase from public.sms_purchases where order_id = p_order_id;
  if purchase is null then
    return json_build_object('success', false, 'error', '주문을 찾을 수 없습니다');
  end if;

  -- 이미 처리된 결제 (멱등성 보장)
  if purchase.status = 'paid' then
    return json_build_object('success', true, 'already_processed', true);
  end if;

  -- 결제 정보 업데이트
  update public.sms_purchases
    set status        = 'paid',
        payment_key   = p_payment_key,
        toss_response = p_toss_data,
        paid_at       = now()
    where order_id = p_order_id;

  -- centers.sms_extra_quota 증가
  -- 단문/장문 구분 없이 단순 합산 (현재 정책)
  update public.centers
    set sms_extra_quota = coalesce(sms_extra_quota, 0) + purchase.count
    where id = purchase.center_id;

  return json_build_object(
    'success', true,
    'count', purchase.count,
    'amount', purchase.amount
  );
end;
$$;

-- ── 결제 실패 처리 함수 ──────────────────────────────────────────
create or replace function public.fail_sms_purchase(p_order_id text, p_reason text)
returns void language sql security definer as $$
  update public.sms_purchases
    set status = 'failed', failed_reason = p_reason
    where order_id = p_order_id and status = 'pending';
$$;
