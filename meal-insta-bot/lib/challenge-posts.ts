/**
 * 챌린지 시리즈 — "30일 X 챌린지" 형태.
 * 자취 인스타 알고리즘 강력: 연속성 → 매일 보러옴.
 *
 * 각 챌린지는 한 번에 한 장의 카드뉴스로 게시되지만, "Day 1, Day 5, ..."
 * 시리즈 형태로 후속 게시 가능 (별도 콘텐츠로 확장).
 */

export interface ChallengeRule {
  day: string;       // "Day 1", "1주차", "매일"
  rule: string;      // 행동 지침
  why: string;       // 이유
}

export interface ChallengeResult {
  metric: string;    // "체중", "식비", "에너지"
  before: string;    // 시작 전
  after: string;     // 종료 후
}

export interface ChallengePost {
  id: string;
  topic: string;          // 헤드라인 ("30일 라면 끊기")
  hookSubtitle: string;   // "자취 챌린지 #01"
  hookBody: string;       // 페인 + 약속
  problem: { title: string; rows: { label: string; value: string }[] };
  rules: ChallengeRule[]; // 5-6개 규칙
  results: ChallengeResult[]; // 3-4개 결과
  joinHook: string;       // "도전 시작 인증"
}

export const CHALLENGE_POSTS: ChallengePost[] = [
  {
    id: "1",
    topic: "30일\n라면 끊기",
    hookSubtitle: "자취 챌린지 #01",
    hookBody:
      "라면 매일 → 주 1회로.\n실험 결과: 체중 -2kg, 식비 -8만원.",
    problem: {
      title: "라면 매일 = 1년 후",
      rows: [
        { label: "체중", value: "+3-5kg (포화지방·나트륨)" },
        { label: "식비", value: "월 +6만원 (외식·간식 보상심리)" },
        { label: "에너지", value: "오후 2시 급격한 저하" },
        { label: "건강", value: "변비·피부 트러블·만성 피로" },
      ],
    },
    rules: [
      { day: "Day 1-7", rule: "라면 1봉 → 토핑 5종 추가", why: "갑자기 끊지 말고 영양 보강부터" },
      { day: "Day 8-14", rule: "주 5회 → 주 3회로", why: "다른 한 끼 익숙해질 시간" },
      { day: "Day 15-21", rule: "주 3회 → 주 1회 고정", why: "라면 = 주말 보상으로 격상" },
      { day: "Day 22-30", rule: "라면 없는 5일 연속", why: "습관 강화 + 새 식단 정착" },
      { day: "매일", rule: "체중·식비 기록", why: "변화 가시화 → 동기 부여" },
    ],
    results: [
      { metric: "체중", before: "변동 없음", after: "-2.3kg" },
      { metric: "월 식비", before: "약 55만원", after: "약 47만원" },
      { metric: "오후 에너지", before: "급격 저하", after: "안정적" },
    ],
    joinHook: "도전 시작하면 댓글에 'Day 1' 인증. 30일 후 결과 공유.",
  },
  {
    id: "2",
    topic: "월 식비\n20만원",
    hookSubtitle: "자취 챌린지 #02",
    hookBody:
      "월 식비 50 → 20만원.\n자취 5년차의 30일 실험 결과.",
    problem: {
      title: "식비 폭발 5대 원인",
      rows: [
        { label: "1", value: "퇴근 후 배달 자동 클릭" },
        { label: "2", value: "마트에서 충동 구매" },
        { label: "3", value: "장본 거 다 못 쓰고 버림" },
        { label: "4", value: "편의점 매일 들름" },
        { label: "5", value: "주말 외식 2회+" },
      ],
    },
    rules: [
      { day: "1주차", rule: "주 1회만 장보기 (5만원 한도)", why: "충동 구매 차단" },
      { day: "1주차", rule: "식단표 먼저 짜고 장보기", why: "필요한 것만 사기" },
      { day: "2주차", rule: "배달 앱 알림 OFF", why: "유혹 자체를 차단" },
      { day: "2주차", rule: "도시락 시작 (주 3회)", why: "점심 외식 차단" },
      { day: "3주차", rule: "편의점 주 1회 한정", why: "월 3만원 절약" },
      { day: "4주차", rule: "주말 외식 1회로", why: "사회생활은 유지" },
    ],
    results: [
      { metric: "월 식비", before: "약 52만원", after: "약 22만원" },
      { metric: "절약", before: "0원", after: "약 30만원" },
      { metric: "1년 환산", before: "—", after: "약 360만원" },
    ],
    joinHook: "현재 식비 댓글로 인증. 30일 후 줄어든 금액 공유.",
  },
  {
    id: "3",
    topic: "21일\n야식 끊기",
    hookSubtitle: "자취 챌린지 #03",
    hookBody:
      "야식 욕구 70%는 가짜 배고픔.\n21일 후 수면·체중·피부 변화.",
    problem: {
      title: "야식의 진짜 비용",
      rows: [
        { label: "수면", value: "위장 활동 → 깊은 잠 -40%" },
        { label: "체중", value: "월 +1.5kg (밤 칼로리는 지방 직행)" },
        { label: "피부", value: "기름·당분 → 트러블 증가" },
        { label: "다음날", value: "식욕 폭주 (보상 심리)" },
      ],
    },
    rules: [
      { day: "1주차", rule: "야식 욕구 → 물 500ml 먼저", why: "70%는 탈수가 가짜 신호" },
      { day: "1주차", rule: "그래도 배고프면 → 그릭요거트·삶은 계란", why: "단백질만 (당분 X)" },
      { day: "2주차", rule: "저녁 식단 단백질 +20%", why: "포만감 ↑ → 야식 욕구 ↓" },
      { day: "2주차", rule: "취침 3시간 전 식사 마감", why: "위장 휴식 시간 확보" },
      { day: "3주차", rule: "야식 0회 5일 연속", why: "습관 정착" },
    ],
    results: [
      { metric: "수면 질", before: "자주 깸·아침 피곤", after: "깊은 잠 +50%" },
      { metric: "체중", before: "기준선", after: "-1.8kg" },
      { metric: "피부", before: "트러블 잦음", after: "안정화" },
    ],
    joinHook: "오늘부터 시작. 21일 후 변화 댓글로 인증.",
  },
  {
    id: "4",
    topic: "주 5일\n도시락",
    hookSubtitle: "자취 챌린지 #04",
    hookBody:
      "점심 외식 7천원 → 도시락 2천원.\n월 10만원 절약 + 영양 +30%.",
    problem: {
      title: "점심 외식 vs 도시락",
      rows: [
        { label: "외식 한 끼", value: "약 7,000원·나트륨·MSG" },
        { label: "도시락 한 끼", value: "약 2,000원·영양 조절 가능" },
        { label: "월 차이", value: "5,000원 × 20일 = 10만원" },
        { label: "1년", value: "약 120만원" },
      ],
    },
    rules: [
      { day: "준비", rule: "도시락통 1L짜리 1개", why: "1만원 미만 투자, 1년 사용" },
      { day: "주말", rule: "닭가슴살·달걀·반찬 미리 조리", why: "평일 5분 컷 위한 베이스" },
      { day: "월", rule: "닭가슴살 + 현미밥 + 채소", why: "단백질 30g 완성" },
      { day: "화", rule: "달걀말이 + 김밥", why: "포만감 + 들고 다니기 쉬움" },
      { day: "수목금", rule: "변형 (참치마요·제육·잡채)", why: "질리지 않는 로테이션" },
    ],
    results: [
      { metric: "월 점심값", before: "약 14만원", after: "약 4만원" },
      { metric: "단백질 일일", before: "약 50g", after: "약 80g" },
      { metric: "오후 졸림", before: "흔함", after: "거의 X" },
    ],
    joinHook: "도시락 사진 댓글 또는 DM. 한 달 인증 시 채널에 소개.",
  },
  {
    id: "5",
    topic: "30일\n단백질 100g",
    hookSubtitle: "자취 챌린지 #05",
    hookBody:
      "근손실 막는 일일 단백질 100g.\n30일 후 체력·근력 변화.",
    problem: {
      title: "자취생 단백질 부족 신호",
      rows: [
        { label: "근손실", value: "팔뚝·다리 살 빠짐" },
        { label: "피로", value: "오후 무기력 잦음" },
        { label: "머리카락", value: "빠짐·가늘어짐" },
        { label: "회복", value: "운동 후 근육통 길게" },
      ],
    },
    rules: [
      { day: "아침", rule: "달걀 2개 + 우유 200ml (단백질 18g)", why: "5분 컷 단백질 시작" },
      { day: "점심", rule: "닭가슴살 100g (단백질 23g)", why: "포만감 + 효율 최고" },
      { day: "간식", rule: "그릭요거트 150g (단백질 15g)", why: "오후 허기 채움" },
      { day: "저녁", rule: "두부 1/2모 + 콩 (단백질 25g)", why: "식물성으로 다양화" },
      { day: "운동일", rule: "단백질 셰이크 +20g", why: "회복 가속" },
    ],
    results: [
      { metric: "일일 단백질", before: "약 50g", after: "약 100g" },
      { metric: "근력 (팔굽혀펴기)", before: "기준", after: "+30%" },
      { metric: "오후 무기력", before: "흔함", after: "거의 X" },
    ],
    joinHook: "현재 일일 단백질 추정 댓글로. 30일 후 변화 인증.",
  },
  {
    id: "6",
    topic: "냉장고\n0원 챌린지",
    hookSubtitle: "자취 챌린지 #06",
    hookBody:
      "장보기 일주일 금지.\n있는 재료로만 — 음식물 쓰레기 -90%.",
    problem: {
      title: "자취 음식물 낭비",
      rows: [
        { label: "월 평균", value: "약 5-8만원어치 폐기" },
        { label: "원인", value: "장보기 → 다 못 씀 → 폐기 반복" },
        { label: "양배추", value: "1통 사서 1/4 쓰고 버림" },
        { label: "두부", value: "유통기한 지나 폐기 잦음" },
      ],
    },
    rules: [
      { day: "Day 0", rule: "냉장고 전수조사", why: "재료 가시화 = 사용 가능성 ↑" },
      { day: "Day 1-2", rule: "신선식품 (채소·고기) 먼저", why: "유통기한 임박부터 처리" },
      { day: "Day 3-4", rule: "냉동 만두·즉석밥 등", why: "재고 정리" },
      { day: "Day 5-7", rule: "통조림·라면 등 가공식", why: "최후 보루로" },
      { day: "매일", rule: "재료 1개 / 한 끼", why: "잔반 비빔밥·볶음밥으로 활용" },
    ],
    results: [
      { metric: "음식물 쓰레기", before: "주 평균 3kg", after: "약 0.3kg" },
      { metric: "월 식비", before: "기준", after: "-8만원" },
      { metric: "냉장고 정리", before: "카오스", after: "5분 정리" },
    ],
    joinHook: "냉장고 사진 댓글 또는 DM. 일주일 후 빈 냉장고 인증.",
  },
  {
    id: "7",
    topic: "30일\n한 끼 자취",
    hookSubtitle: "자취 챌린지 #07",
    hookBody:
      "자취 1년차 → 5년차 식단으로.\n매일 한 끼만 진짜 자취 → 30일 후 완전 적응.",
    problem: {
      title: "자취 초보 vs 5년차",
      rows: [
        { label: "1년차", value: "할 줄 아는 메뉴 2-3개" },
        { label: "1년차 시간", value: "매끼 30분 고민" },
        { label: "5년차", value: "냉장고 보고 즉흥 결정" },
        { label: "5년차 시간", value: "5분 결정·10분 조리" },
      ],
    },
    rules: [
      { day: "1주차", rule: "초간단 5가지 (계란후라이덮밥·라볶이·김치볶음밥 등)", why: "성공 경험부터" },
      { day: "2주차", rule: "응용 5가지 (참치마요·제육·도시락)", why: "변형 능력 추가" },
      { day: "3주차", rule: "본격 5가지 (찌개·잡채·카레)", why: "한식 정복" },
      { day: "4주차", rule: "즉흥 메뉴 도전 (냉장고 보고)", why: "5년차 단계 진입" },
      { day: "매일", rule: "어떤 메뉴든 한 끼 자취", why: "습관 정착" },
    ],
    results: [
      { metric: "할 줄 아는 메뉴", before: "2-3개", after: "20+개" },
      { metric: "메뉴 결정 시간", before: "30분", after: "5분" },
      { metric: "외식 의존", before: "주 5회", after: "주 2회" },
    ],
    joinHook: "1주차 인증부터 댓글. 30일 완주자 채널에 소개.",
  },
  {
    id: "8",
    topic: "7일\n자취 청소",
    hookSubtitle: "자취 챌린지 #08",
    hookBody:
      "냉장고·식기·도구 — 7일 청소 시스템.\n매일 5분, 1주 후 부엌 새것 같음.",
    problem: {
      title: "자취 부엌 흔한 카오스",
      rows: [
        { label: "냉장고", value: "유통기한 지난 음식 잔뜩" },
        { label: "싱크대", value: "씻지 않은 그릇 쌓임" },
        { label: "조리도구", value: "기름때·녹슴" },
        { label: "수납", value: "어디 뭐 있는지 모름" },
      ],
    },
    rules: [
      { day: "Day 1", rule: "냉장고 전수 정리 (15분)", why: "유통기한 지난 거 폐기" },
      { day: "Day 2", rule: "식기 다 닦기·정리 (10분)", why: "다음 6일 유지 위한 시작" },
      { day: "Day 3", rule: "팬·냄비 기름때 제거", why: "베이킹소다 + 식초 5분" },
      { day: "Day 4", rule: "싱크대·가스레인지 (10분)", why: "주방 위생 핵심" },
      { day: "Day 5", rule: "수납 재배치", why: "자주 쓰는 거 앞쪽으로" },
      { day: "Day 6", rule: "조미료·향신료 점검", why: "유통기한·정리" },
      { day: "Day 7", rule: "전체 닦기 + 비포애프터 사진", why: "성취감 + 유지 동기" },
    ],
    results: [
      { metric: "냉장고 정리 시간", before: "30분", after: "5분" },
      { metric: "음식 만들기 의욕", before: "낮음", after: "높음" },
      { metric: "위생", before: "걱정", after: "안심" },
    ],
    joinHook: "Day 1 사진 댓글로 인증. 7일 후 비포애프터 공유.",
  },
];

export function findChallengePost(id: string): ChallengePost | undefined {
  return CHALLENGE_POSTS.find((p) => p.id === id);
}
