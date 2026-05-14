/**
 * 전후 비교 / 실험 결과 — 강력한 비주얼 임팩트.
 * "X 한 달 vs Y 한 달", "1년차 vs 5년차" 등 비교 콘텐츠.
 *
 * 자취 인스타 알고리즘: 비교는 객관성·호기심 동시 유발.
 */

export interface CompareItem {
  /** "Before" / "After", "외식형" / "자취형" 등 */
  label: string;
  /** 한 줄 설명 */
  summary: string;
  /** 상세 row (label-value) */
  rows: { label: string; value: string }[];
}

export interface ComparePost {
  id: string;
  topic: string;          // 헤드라인
  hookSubtitle: string;   // "자취 비교 #01"
  hookBody: string;       // 페인 + 결과 약속
  setup: string;          // 실험 조건 ("동일 자취생 2명·30일")
  itemA: CompareItem;
  itemB: CompareItem;
  diffTitle: string;      // "한 달 후 차이"
  diffRows: { label: string; value: string }[]; // 차이 결과
  conclusion: string;     // 한 줄 결론
  shareHook: string;      // "어느 쪽 더 충격?"
}

export const COMPARE_POSTS: ComparePost[] = [
  {
    id: "1",
    topic: "라면 1달 vs\n균형식 1달",
    hookSubtitle: "자취 비교 #01",
    hookBody:
      "같은 칼로리, 다른 영양.\n자취생 2명 30일 실험 결과.",
    setup: "동일 체중·운동량·수면. 외 모든 조건 동일.",
    itemA: {
      label: "A — 라면 위주",
      summary: "주 5회 라면 + 즉석식",
      rows: [
        { label: "식비", value: "월 22만원" },
        { label: "단백질 일일", value: "약 35g" },
        { label: "나트륨 일일", value: "약 4,500mg (과다)" },
        { label: "조리시간", value: "주 30분" },
      ],
    },
    itemB: {
      label: "B — 균형 자취",
      summary: "주 5회 한 끼 자취 + 도시락",
      rows: [
        { label: "식비", value: "월 28만원" },
        { label: "단백질 일일", value: "약 80g" },
        { label: "나트륨 일일", value: "약 1,800mg" },
        { label: "조리시간", value: "주 5시간" },
      ],
    },
    diffTitle: "30일 후 변화",
    diffRows: [
      { label: "체중", value: "A: +1.2kg / B: -1.8kg" },
      { label: "오후 피로", value: "A: 매일 / B: 거의 X" },
      { label: "변비·피부", value: "A: 잦음 / B: 안정" },
      { label: "비용 차이", value: "월 +6만원 (B가 더 비쌈)" },
    ],
    conclusion: "B는 6만원 더 쓰고\n체력·피부·통장 다 회복.",
    shareHook: "당신은 A형? B형? 댓글로 인증.",
  },
  {
    id: "2",
    topic: "외식 7일 vs\n자취 7일",
    hookSubtitle: "자취 비교 #02",
    hookBody:
      "통장·체중·피부·기분.\n같은 일주일, 다른 결과.",
    setup: "동일 자취생, 한 주는 외식만·한 주는 자취만.",
    itemA: {
      label: "외식 7일",
      summary: "아침·점심·저녁 다 외식",
      rows: [
        { label: "비용", value: "약 21만원 (한 끼 1만원)" },
        { label: "체중", value: "+1.8kg" },
        { label: "나트륨", value: "권장 +150%" },
        { label: "음식 만족도", value: "초반 ↑ → 후반 질림" },
      ],
    },
    itemB: {
      label: "자취 7일",
      summary: "마트 5만원 1회 + 매일 한 끼",
      rows: [
        { label: "비용", value: "약 5만원 (한 끼 2,500원)" },
        { label: "체중", value: "-1kg" },
        { label: "나트륨", value: "권장 80%" },
        { label: "음식 만족도", value: "꾸준한 만족" },
      ],
    },
    diffTitle: "차이",
    diffRows: [
      { label: "비용 차이", value: "16만원 (외식이 4배+)" },
      { label: "체중 차이", value: "2.8kg" },
      { label: "1년 환산", value: "외식 = 자취 +832만원" },
      { label: "건강", value: "자취 압승" },
    ],
    conclusion: "외식 1주 = 자취 1달 비용.\n계산은 늘 거짓말 안 함.",
    shareHook: "이번 주 본인은 외식 몇 끼? 댓글로 인증.",
  },
  {
    id: "3",
    topic: "1년차 vs\n5년차 식단",
    hookSubtitle: "자취 비교 #03",
    hookBody:
      "자취 4년의 차이는 식단에 다 보임.\n초보 vs 마스터.",
    setup: "같은 한 끼 비용 5천원, 자취 1년차와 5년차의 한 끼.",
    itemA: {
      label: "1년차 — 생존 모드",
      summary: "라면·즉석밥·배달 의존",
      rows: [
        { label: "월요일", value: "라면 + 김치" },
        { label: "화요일", value: "배달 한식" },
        { label: "수요일", value: "편의점 도시락" },
        { label: "메뉴 결정", value: "매끼 20분 고민" },
      ],
    },
    itemB: {
      label: "5년차 — 운영 모드",
      summary: "한 끼 자취 + 도시락 + 외식 1회",
      rows: [
        { label: "월요일", value: "닭가슴살 덮밥 (10분)" },
        { label: "화요일", value: "도시락 + 저녁 한식" },
        { label: "수요일", value: "잔반 비빔밥" },
        { label: "메뉴 결정", value: "냉장고 보고 즉흥" },
      ],
    },
    diffTitle: "4년의 차이",
    diffRows: [
      { label: "월 식비", value: "1년차: 55만 / 5년차: 28만" },
      { label: "체중 변화", value: "1년차 +5kg / 5년차 0" },
      { label: "조리 시간", value: "1년차 0분 / 5년차 30분/일" },
      { label: "스트레스", value: "1년차: 메뉴고민 / 5년차: 0" },
    ],
    conclusion: "5년차의 시작 = 다음 한 끼 자취.",
    shareHook: "본인은 몇 년차? 식단 인증 댓글로.",
  },
  {
    id: "4",
    topic: "쿠팡 vs\n마트",
    hookSubtitle: "자취 비교 #04",
    hookBody:
      "쿠팡로켓 = 마트보다 30% 비쌈.\n실제 영수증 비교.",
    setup: "동일한 1주 장보기 리스트, 쿠팡과 마트 가격 비교.",
    itemA: {
      label: "쿠팡 로켓",
      summary: "집에서 클릭, 새벽 도착",
      rows: [
        { label: "쌀 2kg", value: "8,900원" },
        { label: "달걀 30구", value: "13,900원" },
        { label: "닭가슴살 1kg", value: "16,900원" },
        { label: "두부 2모", value: "4,500원" },
        { label: "합계", value: "약 44,200원" },
      ],
    },
    itemB: {
      label: "동네 마트",
      summary: "걸어서 10분, 직접 골라",
      rows: [
        { label: "쌀 2kg", value: "6,500원" },
        { label: "달걀 30구", value: "9,800원" },
        { label: "닭가슴살 1kg", value: "13,500원" },
        { label: "두부 2모", value: "3,000원" },
        { label: "합계", value: "약 32,800원" },
      ],
    },
    diffTitle: "차이",
    diffRows: [
      { label: "일주일", value: "약 11,400원 (35% 차이)" },
      { label: "월", value: "약 45,000원" },
      { label: "1년", value: "약 55만원" },
      { label: "시간", value: "마트 왕복 20분 ≒ 시급 16만원/시" },
    ],
    conclusion: "쿠팡 편리함 = 1년 55만원.\n걸어 10분 마트 = 자취 정답.",
    shareHook: "본인은 어디서 장 봐? 댓글로.",
  },
  {
    id: "5",
    topic: "도시락 vs\n점심외식",
    hookSubtitle: "자취 비교 #05",
    hookBody:
      "직장 점심 7천원 vs 도시락 2천원.\n1년 차이 = 120만원.",
    setup: "직장인 자취생, 점심 외식 vs 도시락 한 달 실험.",
    itemA: {
      label: "점심 외식",
      summary: "주 5일 회사 근처 식당",
      rows: [
        { label: "한 끼 비용", value: "평균 7,500원" },
        { label: "월 점심값", value: "약 15만원" },
        { label: "메뉴", value: "분식·한식·아시안 로테이션" },
        { label: "영양", value: "나트륨·MSG 과다" },
      ],
    },
    itemB: {
      label: "도시락",
      summary: "주말 1회 조리 → 5끼 분",
      rows: [
        { label: "한 끼 비용", value: "약 2,000원" },
        { label: "월 점심값", value: "약 4만원" },
        { label: "메뉴", value: "단백질 + 채소 균형" },
        { label: "영양", value: "조절 가능" },
      ],
    },
    diffTitle: "1개월·1년 차이",
    diffRows: [
      { label: "월 절약", value: "약 11만원" },
      { label: "1년 절약", value: "약 132만원" },
      { label: "5년", value: "약 660만원 (해외여행 3번)" },
      { label: "건강", value: "도시락 압승 — 통제 가능" },
    ],
    conclusion: "도시락 = 1년 132만원 모으기.\n4분의 1 가격으로 더 잘 먹기.",
    shareHook: "도시락 vs 외식? 친구 태그하며 토론.",
  },
  {
    id: "6",
    topic: "장보기 미리 vs\n그때그때",
    hookSubtitle: "자취 비교 #06",
    hookBody:
      "주 1회 장보기 vs 매번 편의점.\n같은 자취생, 다른 결과.",
    setup: "한 명은 주 1회 마트, 다른 한 명은 매끼 편의점.",
    itemA: {
      label: "매번 편의점",
      summary: "퇴근길·점심 시간 편의점",
      rows: [
        { label: "한 끼 평균", value: "약 6,000원" },
        { label: "주 식비", value: "약 12만원" },
        { label: "월 식비", value: "약 50만원" },
        { label: "영양", value: "도시락·간식 균형 X" },
      ],
    },
    itemB: {
      label: "주 1회 마트",
      summary: "토요일 오전, 1주 식단 미리 짜고 장보기",
      rows: [
        { label: "주 1회 비용", value: "약 4-5만원" },
        { label: "주 식비", value: "약 6만원" },
        { label: "월 식비", value: "약 25만원" },
        { label: "영양", value: "조절·균형 가능" },
      ],
    },
    diffTitle: "차이",
    diffRows: [
      { label: "월 차이", value: "약 25만원" },
      { label: "1년 차이", value: "약 300만원" },
      { label: "음식물 쓰레기", value: "마트형 -70%" },
      { label: "시간", value: "마트 1회 30분 vs 편의점 매일 10분" },
    ],
    conclusion: "장보기 30분 = 1년 300만원.\n시간 가성비 최고.",
    shareHook: "본인은 어느 쪽? 댓글로 인증.",
  },
  {
    id: "7",
    topic: "남자 vs 여자\n자취 식단",
    hookSubtitle: "자취 비교 #07",
    hookBody:
      "성별 차이? 의외로 패턴 다름.\n300명 설문 결과.",
    setup: "20대 자취생 남녀 300명 설문 (직접 조사 추정치).",
    itemA: {
      label: "남자 자취생 (150명)",
      summary: "양보다 효율 중심",
      rows: [
        { label: "주 라면 횟수", value: "평균 3.2회" },
        { label: "주 자취 횟수", value: "평균 4.5회" },
        { label: "선호 메뉴", value: "볶음밥·찌개·고기류" },
        { label: "월 식비", value: "평균 약 38만원" },
      ],
    },
    itemB: {
      label: "여자 자취생 (150명)",
      summary: "균형 + 비주얼 중시",
      rows: [
        { label: "주 라면 횟수", value: "평균 1.8회" },
        { label: "주 자취 횟수", value: "평균 5.1회" },
        { label: "선호 메뉴", value: "샐러드·파스타·도시락" },
        { label: "월 식비", value: "평균 약 42만원" },
      ],
    },
    diffTitle: "공통점·차이점",
    diffRows: [
      { label: "공통점 1", value: "배달비 부담 1위 호소" },
      { label: "공통점 2", value: "메뉴 결정 스트레스 70%" },
      { label: "차이점 1", value: "여자: 영양 신경 ↑" },
      { label: "차이점 2", value: "남자: 양 중심" },
    ],
    conclusion: "성별 무관 — 자취 5년차는 다 비슷한 패턴 도달.",
    shareHook: "본인은 어느 패턴? 댓글에 성별 + 식단 키워드.",
  },
  {
    id: "8",
    topic: "쌀 1kg vs\n쌀 4kg",
    hookSubtitle: "자취 비교 #08",
    hookBody:
      "1인 자취에 4kg은 너무 많다?\n실제 보관·소비 패턴 비교.",
    setup: "1인 자취생, 1kg과 4kg 구매 시 패턴 차이.",
    itemA: {
      label: "쌀 1kg 자주",
      summary: "월 1-2회 작은 봉지 구매",
      rows: [
        { label: "1kg 가격", value: "약 4,500원" },
        { label: "1kg당", value: "4,500원" },
        { label: "한 달 소비", value: "약 3-4kg (10kg+ 식비)" },
        { label: "보관", value: "공간 거의 X" },
      ],
    },
    itemB: {
      label: "쌀 4kg 한 번",
      summary: "분기 1번, 큰 봉지",
      rows: [
        { label: "4kg 가격", value: "약 12,000원" },
        { label: "1kg당", value: "약 3,000원 (33% 절약)" },
        { label: "한 달 소비", value: "약 3-4kg (같은 소비)" },
        { label: "보관", value: "쌀통 또는 진공포장 필요" },
      ],
    },
    diffTitle: "차이",
    diffRows: [
      { label: "월 차이", value: "약 6,000원 (4kg이 저렴)" },
      { label: "1년 차이", value: "약 7만원" },
      { label: "장보기 빈도", value: "1kg: 월 2회 / 4kg: 분기 1회" },
      { label: "조건", value: "쌀통 1개 (1만원, 1년 사용)" },
    ],
    conclusion: "공간 있으면 무조건 4kg.\n쌀통 투자 회수 6개월.",
    shareHook: "본인 쌀 사이즈? 댓글로.",
  },
];

export function findComparePost(id: string): ComparePost | undefined {
  return COMPARE_POSTS.find((p) => p.id === id);
}
