-- ================================================================
-- BeautyOn · 러브헤어 홍대점 — Supabase Schema
-- Supabase SQL Editor에서 전체 실행하세요
-- ================================================================

-- ── 0. Extensions ───────────────────────────────────────────────
create extension if not exists "pg_cron" schema extensions;
create extension if not exists "pgcrypto";

-- ── 1. 고객 프로필 ──────────────────────────────────────────────
create table if not exists public.customers (
  id           uuid primary key default gen_random_uuid(),
  auth_uid     uuid unique references auth.users(id) on delete set null,
  name         text not null,
  phone        text,
  birthday     date,
  grade        text not null default 'BRONZE',  -- BRONZE / SILVER / GOLD / DIAMOND
  total_visits integer not null default 0,
  invite_code  text unique default substr(md5(random()::text), 1, 8),
  referred_by  uuid references public.customers(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.customers enable row level security;
create policy "customer_self" on public.customers
  for all using (auth.uid() = auth_uid);

-- ── 2. 예약 ─────────────────────────────────────────────────────
create table if not exists public.bookings (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid not null references public.customers(id) on delete cascade,
  designer     text not null,
  service      text not null,
  price        integer not null,
  booked_at    timestamptz not null,     -- 실제 예약 일시 (날짜+시간)
  duration_min integer not null default 60,
  status       text not null default '예약대기',  -- 예약대기 / 확정 / 완료 / 취소
  note         text,
  created_at   timestamptz not null default now()
);
alter table public.bookings enable row level security;
create policy "booking_self" on public.bookings
  for all using (
    auth.uid() = (select auth_uid from public.customers where id = customer_id)
  );
-- 관리자는 service_role key로 RLS 우회

-- ── 3. 스탬프 ───────────────────────────────────────────────────
create table if not exists public.stamps (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid not null references public.customers(id) on delete cascade,
  booking_id   uuid references public.bookings(id),
  granted_by   text,                     -- 관리자 ID or 'system'
  redeemed     boolean not null default false,
  redeemed_at  timestamptz,
  created_at   timestamptz not null default now()
);
alter table public.stamps enable row level security;
create policy "stamp_self" on public.stamps
  for select using (
    auth.uid() = (select auth_uid from public.customers where id = customer_id)
  );

-- 스탬프 개수 조회 뷰 (유효 스탬프 = redeemed = false)
create or replace view public.stamp_counts as
  select customer_id,
         count(*) filter (where not redeemed) as active,
         count(*) as total
  from public.stamps
  group by customer_id;

-- ── 4. 포인트 거래내역 ──────────────────────────────────────────
create table if not exists public.points_transactions (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid not null references public.customers(id) on delete cascade,
  type         text not null,            -- earn / spend / expire
  amount       integer not null,         -- 양수=적립, 음수=사용
  title        text not null,
  booking_id   uuid references public.bookings(id),
  created_at   timestamptz not null default now()
);
alter table public.points_transactions enable row level security;
create policy "points_self" on public.points_transactions
  for all using (
    auth.uid() = (select auth_uid from public.customers where id = customer_id)
  );

-- 포인트 잔액 뷰
create or replace view public.point_balances as
  select customer_id, coalesce(sum(amount), 0)::integer as balance
  from public.points_transactions
  group by customer_id;

-- ── 5. 쿠폰 ─────────────────────────────────────────────────────
create table if not exists public.coupons (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid references public.customers(id) on delete cascade,  -- null = 전체 발급
  name         text not null,
  description  text,
  discount_type text not null default 'percent',  -- percent / amount
  discount_value integer not null,
  min_amount   integer not null default 0,
  expires_at   timestamptz,
  used         boolean not null default false,
  used_at      timestamptz,
  created_at   timestamptz not null default now()
);
alter table public.coupons enable row level security;
create policy "coupon_self" on public.coupons
  for select using (
    customer_id is null or
    auth.uid() = (select auth_uid from public.customers where id = customer_id)
  );

-- ── 6. 배너 / 프로모션 ──────────────────────────────────────────
create table if not exists public.banners (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  subtitle     text,
  cta_text     text default '자세히 보기',
  bg_color     text default '#c9184a',   -- CSS 컬러
  text_color   text default '#ffffff',
  image_url    text,
  sort_order   integer not null default 0,
  active       boolean not null default true,
  starts_at    timestamptz,
  ends_at      timestamptz,
  created_at   timestamptz not null default now()
);
-- 배너는 공개 읽기
alter table public.banners enable row level security;
create policy "banner_public_read" on public.banners
  for select using (active = true and (starts_at is null or starts_at <= now())
                                  and (ends_at   is null or ends_at   >= now()));

-- ── 7. 푸시 알림 로그 ───────────────────────────────────────────
create table if not exists public.push_log (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid not null references public.customers(id) on delete cascade,
  type         text not null,   -- booking_reminder / review_request / birthday / reengagement
  channel      text not null default 'fcm',   -- fcm / kakao / sms
  content      text,
  sent_at      timestamptz not null default now(),
  status       text not null default 'sent'   -- sent / failed / clicked
);

-- ── 8. 네이버 플레이스 연동 설정 ──────────────────────────────────
create table if not exists public.shop_settings (
  key   text primary key,
  value text
);
insert into public.shop_settings (key, value) values
  ('naver_place_url',  ''),
  ('kakao_channel_id', ''),
  ('shop_name',        '러브헤어 홍대점'),
  ('shop_hours',       '11:00 ~ 20:00'),
  ('shop_phone',       '02-000-0000')
on conflict (key) do nothing;

-- ================================================================
-- AUTOMATION — pg_cron 스케줄 (Edge Functions 연동)
-- Supabase Dashboard > Database > Extensions 에서 pg_cron 활성화 후 실행
-- ================================================================

-- 24시간 전 예약 알림 (매 시간 정각 실행)
select cron.schedule(
  'booking-reminder-24h',
  '0 * * * *',
  $$
    insert into public.push_log (customer_id, type, content)
    select b.customer_id,
           'booking_reminder',
           '내일 ' || to_char(b.booked_at, 'HH24:MI') || ' ' || b.service || ' 예약이 있습니다 💅'
    from public.bookings b
    where b.status = '확정'
      and b.booked_at between now() + interval '23 hours' and now() + interval '25 hours'
  $$
);

-- 방문 다음날 리뷰 요청 (매일 오전 10시)
select cron.schedule(
  'post-visit-review',
  '0 10 * * *',
  $$
    insert into public.push_log (customer_id, type, content)
    select b.customer_id,
           'review_request',
           '어제 방문 어떠셨나요? 솔직한 리뷰를 남겨주세요 ⭐'
    from public.bookings b
    where b.status = '완료'
      and b.booked_at::date = current_date - 1
      and not exists (
        select 1 from public.push_log p
        where p.customer_id = b.customer_id
          and p.type = 'review_request'
          and p.sent_at::date = current_date
      )
  $$
);

-- 생일 쿠폰 발급 (매일 오전 9시)
select cron.schedule(
  'birthday-coupon',
  '0 9 * * *',
  $$
    insert into public.coupons (customer_id, name, description, discount_type, discount_value, expires_at)
    select id,
           '생일 축하 쿠폰 🎂',
           '모든 시술에 적용 가능',
           'percent',
           10,
           now() + interval '30 days'
    from public.customers
    where to_char(birthday, 'MM-DD') = to_char(current_date, 'MM-DD')
      and not exists (
        select 1 from public.coupons c
        where c.customer_id = customers.id
          and c.name = '생일 축하 쿠폰 🎂'
          and c.created_at::date = current_date
      )
  $$
);

-- 90일 미방문 재방문 유도 (매주 월요일 오전 10시)
select cron.schedule(
  'reengagement-90d',
  '0 10 * * 1',
  $$
    insert into public.push_log (customer_id, type, content)
    select c.id,
           'reengagement',
           '보고 싶었어요 💝 오랜만에 방문하시면 10% 할인 쿠폰을 드립니다!'
    from public.customers c
    where (
      select max(booked_at) from public.bookings
      where customer_id = c.id and status = '완료'
    ) < now() - interval '90 days'
    and not exists (
      select 1 from public.push_log p
      where p.customer_id = c.id
        and p.type = 'reengagement'
        and p.sent_at > now() - interval '30 days'
    )
  $$
);

-- ── 스탬프 10개 → 무료 시술 쿠폰 자동 발급 ──────────────────────
create or replace function public.auto_stamp_reward()
returns trigger language plpgsql security definer as $$
declare
  stamp_count integer;
begin
  select count(*) into stamp_count
  from public.stamps
  where customer_id = new.customer_id and not redeemed;

  if stamp_count >= 10 then
    -- 스탬프 10개 사용 처리
    update public.stamps set redeemed = true, redeemed_at = now()
    where customer_id = new.customer_id and not redeemed
    order by created_at asc
    limit 10;

    -- 무료 시술 쿠폰 발급
    insert into public.coupons (customer_id, name, description, discount_type, discount_value, expires_at)
    values (new.customer_id, '스탬프 적립 리워드 💅', '커트 무료 시술권 (1회)', 'amount', 45000, now() + interval '60 days');
  end if;
  return new;
end;
$$;

create trigger stamp_reward_trigger
  after insert on public.stamps
  for each row execute function public.auto_stamp_reward();

-- ── updated_at 자동 갱신 ─────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger customers_updated_at before update on public.customers
  for each row execute function public.set_updated_at();

-- ================================================================
-- 테스트 데이터 (선택 사항 — 실운영 전 삭제)
-- ================================================================
-- insert into public.banners (title, subtitle, bg_color, sort_order) values
--   ('봄 특가 20% 할인', '케라틴 트리트먼트 · 4월 한정', '#a4133c', 1),
--   ('신상 발레아쥬', '자연스러운 그라데이션 컬러', '#3d2b1f', 2),
--   ('두피 케어 패키지', '트리트먼트 + 두피 마사지', '#b8860b', 3),
--   ('신규 고객 혜택', '첫 방문 커트 무료', '#2d6a4f', 4);
