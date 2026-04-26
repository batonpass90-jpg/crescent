-- ================================================================
-- CareOn Schema v4 — 보호사 가입 자동 연결
-- 1) workers.email 컬럼 추가
-- 2) workers.status에 'pending_signup' 상태 도입
-- 3) link_worker_account() RPC: 보호사 가입 시 이메일로 매칭
-- ================================================================

-- ── 0. workers 테이블 누락 컬럼 안전 추가 (이전 버전 호환) ─────
alter table public.workers add column if not exists profile_id uuid references public.profiles(id) on delete set null;
alter table public.workers add column if not exists status text not null default 'active';
alter table public.workers add column if not exists hire_date date;
alter table public.workers add column if not exists specialty text;
alter table public.workers add column if not exists base_salary integer;

-- ── 1. workers.email + 인덱스 ────────────────────────────────────
alter table public.workers add column if not exists email text;
create unique index if not exists workers_email_pending_idx
  on public.workers (lower(email))
  where profile_id is null and email is not null;

-- ── 2. status comment 갱신 ───────────────────────────────────────
comment on column public.workers.status is
  'pending_signup | active | inactive (해지)';

-- ── 3. 보호사 계정 자동 연결 함수 ────────────────────────────────
-- 보호사가 가입한 직후 본인이 직접 호출 (security definer로 RLS 우회)
create or replace function public.link_worker_account()
returns json language plpgsql security definer as $$
declare
  worker_rec record;
  user_email text;
begin
  -- 현재 로그인 사용자의 이메일 조회
  select email into user_email from auth.users where id = auth.uid();
  if user_email is null then
    return json_build_object('success', false, 'error', '이메일을 확인할 수 없습니다.');
  end if;

  -- 같은 이메일로 등록된 미연결 workers 레코드 찾기
  select * into worker_rec from public.workers
  where lower(email) = lower(user_email)
    and profile_id is null
    and status = 'pending_signup'
  order by created_at desc limit 1;

  if worker_rec is null then
    return json_build_object(
      'success', false,
      'error', '센터장이 등록한 보호사 정보를 찾을 수 없어요. 센터에 등록 요청 후 다시 시도해주세요.'
    );
  end if;

  -- workers.profile_id 연결 + status active 전환
  update public.workers
    set profile_id = auth.uid(), status = 'active'
    where id = worker_rec.id;

  -- profiles.center_id 자동 설정
  update public.profiles
    set center_id = worker_rec.center_id, role = 'worker'
    where id = auth.uid();

  return json_build_object(
    'success', true,
    'center_id', worker_rec.center_id,
    'worker_name', worker_rec.name,
    'worker_id', worker_rec.id
  );
end;
$$;

-- ── 4. 센터장이 보호사 해지 함수 (workers.status='inactive') ─────
-- 데이터는 보존 (visits 이력 등 감사 추적), 로그인만 차단
create or replace function public.deactivate_worker(p_worker_id uuid)
returns json language plpgsql security definer as $$
declare
  w record;
begin
  -- 권한 체크: 본인 센터의 보호사인지
  select * into w from public.workers where id = p_worker_id;
  if w is null then
    return json_build_object('success', false, 'error', '보호사를 찾을 수 없습니다.');
  end if;
  if w.center_id != public.get_my_center_id() and public.get_my_role() != 'superadmin' then
    return json_build_object('success', false, 'error', '권한이 없습니다.');
  end if;

  update public.workers set status = 'inactive' where id = p_worker_id;

  -- profile의 center_id도 해제 (다른 센터 가입 가능하도록)
  if w.profile_id is not null then
    update public.profiles set center_id = null where id = w.profile_id;
  end if;

  return json_build_object('success', true);
end;
$$;

-- ── 사용 예시 ────────────────────────────────────────────────────
-- -- 보호사 가입 완료 직후
-- select link_worker_account();
-- -- → { success: true, center_id: ..., worker_name: ... }
--
-- -- 센터장이 보호사 해지
-- select deactivate_worker('<worker_uuid>');
