-- shorts-script 전용 Supabase 프로젝트 스키마
-- CareOn/beauty 등 다른 사업 프로젝트와 분리된 신규 프로젝트에 적용할 것.
-- 모든 접근은 Next.js API 라우트가 SUPABASE_SERVICE_ROLE_KEY로만 수행한다(클라이언트에서 직접 접근하지 않음).
-- RLS는 방어적으로 켜두되 별도 정책은 만들지 않는다 — service role은 RLS를 우회하므로 서버 라우트는 영향받지 않고,
-- 혹시라도 anon/authenticated 키가 실수로 노출되더라도 아무 것도 조회/변경할 수 없게 막는다.

create table if not exists jobs (
  id text primary key,                     -- shorts-script-worker의 job id와 동일
  product_name text not null,
  source_type text not null,               -- 'upload' | 'url'
  source_url text,
  status text not null,
  duration_sec numeric,
  is_longform boolean,
  language text,
  error_message text,
  selected_highlight jsonb,                -- { start_sec, end_sec } (롱폼인 경우)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jobs_created_at_idx on jobs (created_at desc);

alter table jobs enable row level security;

create table if not exists product_research (
  job_id text primary key references jobs (id) on delete cascade,
  problem_solved text,
  selling_points jsonb not null default '[]',
  review_keywords jsonb not null default '[]',
  verified_numbers jsonb not null default '[]',
  sources jsonb not null default '[]',
  insufficient_data boolean not null default false,
  created_at timestamptz not null default now()
);

alter table product_research enable row level security;

create table if not exists scripts (
  job_id text primary key references jobs (id) on delete cascade,
  hook_line text,
  script_rows jsonb not null default '[]',
  estimated_runtime_sec integer,
  bgm_note text,
  created_at timestamptz not null default now()
);

alter table scripts enable row level security;
