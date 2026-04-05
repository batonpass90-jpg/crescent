export const CATEGORY_LABELS: Record<string, string> = {
  BeautyOn: '뷰티', CarOn: '자동차', EduOn: '교육',
  ReviewOn: '리뷰', CareOn: '돌봄', InsureOn: '보험', FactoryOn: '공장',
};

export const CATEGORY_COLORS: Record<string, string> = {
  BeautyOn: '#ec4899', CarOn: '#3b82f6', EduOn: '#8b5cf6',
  ReviewOn: '#f59e0b', CareOn: '#10b981', InsureOn: '#06b6d4', FactoryOn: '#6366f1',
};

export const STATUS_LABELS: Record<string, string> = {
  new: '신규', sent: '문자발송', replied: '응답',
  consulting: '상담중', contracted: '계약완료', rejected: '거절',
};

export const STATUS_COLORS: Record<string, string> = {
  new: '#64748b', sent: '#3b82f6', replied: '#f59e0b',
  consulting: '#8b5cf6', contracted: '#22c55e', rejected: '#ef4444',
};

export const PRODUCTS = ['BeautyOn', 'CarOn', 'EduOn', 'ReviewOn', 'CareOn', 'InsureOn', 'FactoryOn'];
export const STAGES = ['new', 'sent', 'replied', 'consulting', 'contracted', 'rejected'] as const;

export const ADDONS: Record<string, number> = {
  '예약 기능': 50000, '리뷰 자동화': 30000, '포인트 시스템': 40000,
  'AI 챗봇': 80000, '매출 분석': 30000, '직원 관리': 20000,
};

export const DEFAULT_TEMPLATES = [
  { id: 't1', name: '헤어샵 기본', category: 'BeautyOn', content: '안녕하세요, {업체명} 원장님!\n크레센트 스튜디오입니다 😊\n헤어샵 전용 예약앱 BeautyOn을 소개드려요.\n✅ 카카오 로그인  ✅ 실시간 예약  ✅ 고객 관리\n월 9만9천원부터! 잠깐 통화 가능하실까요?', variables: ['업체명'], send_count: 0, reply_count: 0 },
  { id: 't2', name: '카센터 기본', category: 'CarOn', content: '안녕하세요, {업체명} 사장님!\n자동차 정비소 전용 앱 CarOn입니다.\n✅ 차량 접수/진행 알림  ✅ 고객 히스토리\n월 9만9천원, 14일 무료 체험! 통화 가능하세요?', variables: ['업체명'], send_count: 0, reply_count: 0 },
  { id: 't3', name: '학원 기본', category: 'EduOn', content: '안녕하세요, {업체명} 원장님!\n학원 전용 관리 앱 EduOn입니다.\n✅ 출결 알림  ✅ 수업 일정  ✅ 학부모 소통\n14일 무료 체험 가능합니다! 연락 주세요 😊', variables: ['업체명'], send_count: 0, reply_count: 0 },
  { id: 't4', name: '식당/카페 기본', category: 'ReviewOn', content: '안녕하세요, {업체명} 사장님!\n리뷰 관리&예약 앱 ReviewOn입니다.\n✅ 네이버/구글 리뷰 통합  ✅ 포인트 적립\n재방문율 평균 30% 상승! 통화 한번 드려도 될까요?', variables: ['업체명'], send_count: 0, reply_count: 0 },
];
