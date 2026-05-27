-- ================================================================
-- 스튜디오 코어 필라테스 — 다중 텐트 SaaS 스키마
-- Supabase SQL Editor에서 전체 실행하세요.
-- ================================================================
--
-- 사전 작업:
--   1. Supabase Dashboard > Authentication > Providers > Email 활성화
--   2. Supabase Dashboard > Storage 에서 'pilates-public' 버킷 생성 (public)
--      RLS: anon 읽기 허용, authenticated 쓰기 허용
--
-- 모든 테이블은 prefix `pilates_` 사용 (다른 프로젝트와 충돌 방지)
-- ================================================================

-- ── Extensions ────────────────────────────────────────────────
create extension if not exists "pgcrypto";


-- ── 1. 센터 (테넌트) ───────────────────────────────────────────
create table if not exists public.pilates_centers (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,        -- URL: /pilates/?c=slug
  owner_id          uuid references auth.users(id) on delete set null,
  name              text not null,                -- "스튜디오 코어"
  brand             text default '필라테스',       -- 로고 옆 작은 글자
  tagline           text,                          -- 상단 띠 메시지
  hero_title        text,                          -- 히어로 메인 카피
  hero_highlight    text,                          -- 강조 부분
  hero_subtitle     text,                          -- 히어로 서브 라인
  hero_description  text,                          -- 히어로 설명
  phone             text,
  address           text,
  address_detail    text,
  business_hours    text,                          -- "평일 07:00~22:00 | 주말 09:00~18:00"
  parking_info      text,
  subway_info       text,
  business_number   text,
  ceo_name          text,
  intro_paragraph   text,                          -- 강사 소개 페이지 인트로
  hero_image_url    text,
  primary_color     text default '#6B5CE7',
  kakao_link        text default 'https://open.kakao.com/',
  stats             jsonb default '[]'::jsonb,    -- [{"num":"500+","label":"누적 회원"}]
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists idx_pilates_centers_slug on public.pilates_centers(slug);
create index if not exists idx_pilates_centers_owner on public.pilates_centers(owner_id);


-- ── 2. 강사 ────────────────────────────────────────────────────
create table if not exists public.pilates_instructors (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references public.pilates_centers(id) on delete cascade,
  name          text not null,
  role          text,                  -- "대표 강사 · 10년 경력"
  bio           text,
  photo_url     text,
  emoji         text default '👩',     -- 사진 없을 때 placeholder
  certs         text[] default array[]::text[],
  display_order int not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists idx_pilates_instructors_center on public.pilates_instructors(center_id, display_order);


-- ── 3. 수업 종류 ───────────────────────────────────────────────
create table if not exists public.pilates_classes (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references public.pilates_centers(id) on delete cascade,
  name          text not null,         -- "1:1 개인 수업"
  description   text,
  price         text,                  -- "월 30만원~"
  emoji         text default '🧘',
  bg_color      text default '#F0EFFE',
  display_order int not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists idx_pilates_classes_center on public.pilates_classes(center_id, display_order);


-- ── 4. 시간표 ──────────────────────────────────────────────────
create table if not exists public.pilates_schedule (
  id              uuid primary key default gen_random_uuid(),
  center_id       uuid not null references public.pilates_centers(id) on delete cascade,
  day_of_week     int not null check (day_of_week between 0 and 6), -- 0=월, 6=일
  start_time      text not null,         -- "10:00"
  end_time        text,                  -- "11:00"
  class_type      text,                  -- 'solo' | 'duo' | 'group' | 'preg'
  class_name      text,                  -- "1:1 수업"
  instructor_name text,
  display_order   int not null default 0,
  created_at      timestamptz not null default now()
);
create index if not exists idx_pilates_schedule_center on public.pilates_schedule(center_id, day_of_week);


-- ── 5. 가격 (PT 패키지) ────────────────────────────────────────
create table if not exists public.pilates_pricing (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references public.pilates_centers(id) on delete cascade,
  name          text not null,         -- "1:1 10회권"
  amount        text not null,         -- "300,000"
  unit          text default '원',
  features      text[] default array[]::text[],
  featured      boolean not null default false,
  badge         text,                  -- "추천", "BEST"
  display_order int not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists idx_pilates_pricing_center on public.pilates_pricing(center_id, display_order);


-- ── 6. 유튜브 영상 ─────────────────────────────────────────────
create table if not exists public.pilates_youtube (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references public.pilates_centers(id) on delete cascade,
  video_id      text not null,         -- YouTube video ID (e.g. "dQw4w9WgXcQ")
  title         text,
  description   text,
  display_order int not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists idx_pilates_youtube_center on public.pilates_youtube(center_id, display_order);


-- ── RLS (Row Level Security) ───────────────────────────────────
alter table public.pilates_centers     enable row level security;
alter table public.pilates_instructors enable row level security;
alter table public.pilates_classes     enable row level security;
alter table public.pilates_schedule    enable row level security;
alter table public.pilates_pricing     enable row level security;
alter table public.pilates_youtube     enable row level security;

-- 공개 읽기 (방문자가 보는 사이트)
drop policy if exists "public_read" on public.pilates_centers;
create policy "public_read" on public.pilates_centers     for select using (true);
drop policy if exists "public_read" on public.pilates_instructors;
create policy "public_read" on public.pilates_instructors for select using (true);
drop policy if exists "public_read" on public.pilates_classes;
create policy "public_read" on public.pilates_classes     for select using (true);
drop policy if exists "public_read" on public.pilates_schedule;
create policy "public_read" on public.pilates_schedule    for select using (true);
drop policy if exists "public_read" on public.pilates_pricing;
create policy "public_read" on public.pilates_pricing     for select using (true);
drop policy if exists "public_read" on public.pilates_youtube;
create policy "public_read" on public.pilates_youtube     for select using (true);

-- 인증 사용자: 자기 센터만 INSERT/UPDATE/DELETE
drop policy if exists "owner_insert" on public.pilates_centers;
create policy "owner_insert" on public.pilates_centers
  for insert with check (owner_id = auth.uid());
drop policy if exists "owner_update" on public.pilates_centers;
create policy "owner_update" on public.pilates_centers
  for update using (owner_id = auth.uid());
drop policy if exists "owner_delete" on public.pilates_centers;
create policy "owner_delete" on public.pilates_centers
  for delete using (owner_id = auth.uid());

-- 자식 테이블: center_id가 본인 소유 센터일 때만 쓰기 가능
do $$
declare
  t text;
begin
  foreach t in array array['pilates_instructors','pilates_classes','pilates_schedule','pilates_pricing','pilates_youtube']
  loop
    execute format($f$
      drop policy if exists "owner_all" on public.%I;
      create policy "owner_all" on public.%I
        for all using (
          center_id in (select id from public.pilates_centers where owner_id = auth.uid())
        )
        with check (
          center_id in (select id from public.pilates_centers where owner_id = auth.uid())
        );
    $f$, t, t);
  end loop;
end $$;


-- ── updated_at 자동 갱신 트리거 ───────────────────────────────
create or replace function public.pilates_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_pilates_centers_updated on public.pilates_centers;
create trigger trg_pilates_centers_updated
  before update on public.pilates_centers
  for each row execute function public.pilates_set_updated_at();


-- ================================================================
-- 데모 시드: slug='demo' (owner_id NULL — 누구나 읽기만 가능)
-- ================================================================
insert into public.pilates_centers (
  slug, owner_id, name, brand, tagline,
  hero_title, hero_highlight, hero_subtitle, hero_description,
  phone, address, address_detail,
  business_hours, parking_info, subway_info,
  business_number, ceo_name, intro_paragraph,
  stats
) values (
  'demo', null, '스튜디오 코어', '필라테스',
  '지금 등록하면, 첫 수업 1회 무료 체험!',
  '내 몸에 딱 맞는', '1:1 맞춤 필라테스', '지금 시작하세요',
  '체형 교정부터 코어 강화까지, 전문 강사와 함께하는 맞춤형 프로그램을 경험해 보세요.',
  '010-0000-0000', '서울시 강남구 테헤란로 123, 4층', '강남빌딩 4F',
  '평일 07:00~22:00 | 주말 09:00~18:00',
  '건물 지하 1~3층 무료 주차',
  '강남역 11번 출구 도보 5분',
  '000-00-00000', '김지연', '검증된 자격증과 다년간의 현장 경험을 갖춘 강사진이 함께합니다',
  '[{"num":"500+","label":"누적 회원"},{"num":"5년","label":"운영 경력"},{"num":"4.9★","label":"회원 만족도"}]'::jsonb
) on conflict (slug) do nothing;

-- 데모 데이터: 강사
insert into public.pilates_instructors (center_id, name, role, bio, emoji, certs, display_order)
select c.id, '김지연 원장', '대표 강사 · 10년 경력',
  '척추측만증·디스크 재활 전문 강사로, 2,000명 이상의 회원을 지도한 경험을 보유하고 있습니다. 체형 분석을 통한 맞춤형 프로그램 설계가 강점입니다.',
  '👩',
  array['STOTT PILATES 국제 자격증','재활 필라테스 전문 과정 수료','척추측만증 교정 전문 과정','스포츠재활 지도자 2급'],
  0
from public.pilates_centers c where c.slug = 'demo'
and not exists (select 1 from public.pilates_instructors i where i.center_id = c.id and i.name = '김지연 원장');

insert into public.pilates_instructors (center_id, name, role, bio, emoji, certs, display_order)
select c.id, '이서현 강사', '그룹·임산부 전문 · 5년 경력',
  '임산부 필라테스 전문 수료 후 산전·산후 관리에 특화된 강사입니다. 따뜻하고 꼼꼼한 케어로 회원 만족도가 가장 높습니다.',
  '👩',
  array['BASI PILATES 국제 자격증','임산부 필라테스 전문 과정 수료','산전·산후 운동 지도사','그룹 피트니스 지도자 1급'],
  1
from public.pilates_centers c where c.slug = 'demo'
and not exists (select 1 from public.pilates_instructors i where i.center_id = c.id and i.name = '이서현 강사');

-- 데모 데이터: 수업 종류
insert into public.pilates_classes (center_id, name, description, price, emoji, bg_color, display_order)
select c.id, '1:1 개인 수업', '강사와 단둘이 진행하는 맞춤형 수업. 체형 교정·재활에 최적화.', '월 30만원~', '🧘', '#F0EFFE', 0
from public.pilates_centers c where c.slug='demo'
and not exists (select 1 from public.pilates_classes x where x.center_id=c.id and x.name='1:1 개인 수업');
insert into public.pilates_classes (center_id, name, description, price, emoji, bg_color, display_order)
select c.id, '듀엣 수업', '친구·커플과 함께 받는 2인 수업. 합리적인 가격으로 케어.', '월 22만원~', '👥', '#FFF9E6', 1
from public.pilates_centers c where c.slug='demo'
and not exists (select 1 from public.pilates_classes x where x.center_id=c.id and x.name='듀엣 수업');
insert into public.pilates_classes (center_id, name, description, price, emoji, bg_color, display_order)
select c.id, '그룹 수업', '최대 6인 소규모 그룹. 함께하는 동기부여와 즐거움.', '월 15만원~', '🏃', '#FEF0F0', 2
from public.pilates_centers c where c.slug='demo'
and not exists (select 1 from public.pilates_classes x where x.center_id=c.id and x.name='그룹 수업');
insert into public.pilates_classes (center_id, name, description, price, emoji, bg_color, display_order)
select c.id, '임산부 수업', '임신 중 안전한 운동. 전문 자격 강사와 함께.', '월 28만원~', '🌿', '#EFF6FF', 3
from public.pilates_centers c where c.slug='demo'
and not exists (select 1 from public.pilates_classes x where x.center_id=c.id and x.name='임산부 수업');

-- 데모 데이터: 가격
insert into public.pilates_pricing (center_id, name, amount, unit, features, featured, badge, display_order)
select c.id, '1:1 10회권', '300,000', '원', array['1회 50분','3개월 유효','체형 분석 1회 무료'], false, null, 0
from public.pilates_centers c where c.slug='demo'
and not exists (select 1 from public.pilates_pricing x where x.center_id=c.id and x.name='1:1 10회권');
insert into public.pilates_pricing (center_id, name, amount, unit, features, featured, badge, display_order)
select c.id, '1:1 20회권', '560,000', '원', array['1회 50분','5개월 유효','체형 분석 + 자세 분석 무료'], true, 'BEST', 1
from public.pilates_centers c where c.slug='demo'
and not exists (select 1 from public.pilates_pricing x where x.center_id=c.id and x.name='1:1 20회권');
insert into public.pilates_pricing (center_id, name, amount, unit, features, featured, badge, display_order)
select c.id, '듀엣 20회권', '440,000', '원', array['1회 50분','5개월 유효','2인 동시 진행'], false, null, 2
from public.pilates_centers c where c.slug='demo'
and not exists (select 1 from public.pilates_pricing x where x.center_id=c.id and x.name='듀엣 20회권');
insert into public.pilates_pricing (center_id, name, amount, unit, features, featured, badge, display_order)
select c.id, '그룹 무제한', '150,000', '원/월', array['주 3회 이상 수강','월 단위 결제','약정 없음'], false, null, 3
from public.pilates_centers c where c.slug='demo'
and not exists (select 1 from public.pilates_pricing x where x.center_id=c.id and x.name='그룹 무제한');

-- 데모 데이터: 시간표
insert into public.pilates_schedule (center_id, day_of_week, start_time, end_time, class_type, class_name, instructor_name, display_order)
select c.id, d, t.start_t, t.end_t, t.kind, t.cname, t.iname, t.ord
from public.pilates_centers c,
     generate_series(0,4) d,  -- 월~금
     (values
       ('07:00','08:00','solo','1:1 수업','김지연',0),
       ('10:00','11:00','group','그룹','이서현',1),
       ('14:00','15:00','duo','듀엣','김지연',2),
       ('19:00','20:00','solo','1:1 수업','이서현',3),
       ('20:30','21:30','preg','임산부','이서현',4)
     ) as t(start_t,end_t,kind,cname,iname,ord)
where c.slug='demo'
and not exists (select 1 from public.pilates_schedule s where s.center_id=c.id);

-- 데모 데이터: 유튜브
insert into public.pilates_youtube (center_id, video_id, title, description, display_order)
select c.id, 'K6CMJ-9KsTU', '초보자를 위한 필라테스 기초', '집에서 따라할 수 있는 5분 필라테스 루틴', 0
from public.pilates_centers c where c.slug='demo'
and not exists (select 1 from public.pilates_youtube y where y.center_id=c.id);
insert into public.pilates_youtube (center_id, video_id, title, description, display_order)
select c.id, 'L_AYjeMNHpA', '코어 강화 루틴', '복부와 허리를 단단하게 만드는 10분 루틴', 1
from public.pilates_centers c where c.slug='demo'
and not exists (select 1 from public.pilates_youtube y where y.center_id=c.id and video_id='L_AYjeMNHpA');
insert into public.pilates_youtube (center_id, video_id, title, description, display_order)
select c.id, 'aE-_4P9LcfM', '체형 교정 스트레칭', '거북목·라운드숄더 교정 루틴', 2
from public.pilates_centers c where c.slug='demo'
and not exists (select 1 from public.pilates_youtube y where y.center_id=c.id and video_id='aE-_4P9LcfM');

-- ================================================================
-- 끝.  Supabase Dashboard > Storage 에서:
--   - 'pilates-public' 버킷 생성 (Public)
--   - 정책: SELECT 누구나, INSERT/UPDATE/DELETE는 authenticated
-- ================================================================
