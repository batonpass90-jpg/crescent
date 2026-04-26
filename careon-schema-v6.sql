-- ================================================================
-- CareOn Schema v6 — 센터별 Solapi 발신번호
-- 본사 Solapi 계정 1개에 각 센터의 번호를 등록하고,
-- centers.solapi_from_number를 통해 센터별로 다른 번호로 발송
-- ================================================================

alter table public.centers add column if not exists solapi_from_number text;

comment on column public.centers.solapi_from_number is
  '센터별 SMS 발신번호 (본사 Solapi 계정에 사전등록된 번호). 미설정 시 SOLAPI_FROM_NUMBER 환경변수 fallback';

-- 사용 예시
-- update centers set solapi_from_number = '0316829090' where slug = 'sunshine';
-- update centers set solapi_from_number = '0317829090' where slug = 'seoulcare';
