/**
 * 숨겨진 진실 / 폭로 — 호기심·저장 강력.
 * "X가 안 알려주는 Y", "Z의 진실" 톤.
 *
 * 알고리즘 친화: 호기심 트리거 + 저장 (다시 보고 싶음) + 공유 (충격적).
 */

export interface TruthFact {
  /** 충격적 사실 한 줄 */
  fact: string;
  /** 근거·설명 */
  evidence: string;
}

export interface TruthPost {
  id: string;
  topic: string;          // 헤드라인 ("편의점이 안 알려주는 5가지")
  hookSubtitle: string;   // "자취 진실 #01"
  hookBody: string;       // 호기심 폭발 후크
  setup: { title: string; rows: { label: string; value: string }[] }; // 배경 정보
  facts: TruthFact[];     // 5가지 충격 사실
  action: { title: string; rows: { label: string; value: string }[] }; // 대응 방법
  conclusion: string;     // 한 줄 정리
  saveHook: string;       // 저장 유도
}

export const TRUTH_POSTS: TruthPost[] = [
  {
    id: "1",
    topic: "편의점이\n안 알려주는 5",
    hookSubtitle: "자취 진실 #01",
    hookBody:
      "편의점 도시락 영양표시 뒤집어보면.\n5가지 충격 사실.",
    setup: {
      title: "편의점 의존 1인 가구 현실",
      rows: [
        { label: "평균", value: "주 4-5회 방문" },
        { label: "지출", value: "월 약 18만원" },
        { label: "주력 구매", value: "도시락·삼각김밥·컵라면" },
      ],
    },
    facts: [
      {
        fact: "1. 도시락 단백질은 표기보다 적다",
        evidence: "닭고기 비율 30% → 실제 살코기는 절반. 단백질 표기 25g → 실제 18-20g.",
      },
      {
        fact: "2. '저칼로리'는 1회분 함정",
        evidence: "패키지 전체 300kcal X. 1회분 300kcal, 1봉지엔 2-3회분.",
      },
      {
        fact: "3. 컵라면은 일일 나트륨 75% 한 봉지",
        evidence: "성인 권장 2,000mg, 컵라면 1봉 1,500mg+. 국물 다 마시면 90%.",
      },
      {
        fact: "4. 삼각김밥 '명품화 1+1'은 1+0.5",
        evidence: "용량 -20%·가격 동일. 인플레이션 숨김 전략.",
      },
      {
        fact: "5. 유통기한은 '판매기한', 진짜 한계는 +3-5일",
        evidence: "표기일 = 매장 진열 기한. 실제 식품 안전은 그 후 3-5일까지 OK.",
      },
    ],
    action: {
      title: "현명한 편의점 활용",
      rows: [
        { label: "추천", value: "삶은 계란·바나나·우유 (영양표시 정직)" },
        { label: "비추천", value: "1+1 도시락·컵라면+삼각김밥 조합" },
        { label: "체크", value: "1회분 기준 칼로리·단백질·나트륨" },
      ],
    },
    conclusion: "편의점 무조건 X 아님.\n사는 법을 알면 가성비 OK.",
    saveHook: "다음 편의점 갈 때 저장된 이거 꺼내보기.",
  },
  {
    id: "2",
    topic: "유튜브 자취\n레시피 함정",
    hookSubtitle: "자취 진실 #02",
    hookBody:
      "구독자 100만 자취 채널들의 비밀.\n레시피 5가지 함정.",
    setup: {
      title: "자취 유튜브 시장 현실",
      rows: [
        { label: "구독자", value: "TOP 채널 100만+" },
        { label: "광고", value: "한 영상 약 3-5천만원" },
        { label: "핵심 인사이트", value: "레시피보다 비주얼·드라마" },
      ],
    },
    facts: [
      {
        fact: "1. '5분 컷' 영상 = 실제 25분",
        evidence: "재료 다듬기·설거지는 편집. 실제 자취생이 따라하면 영상 5배.",
      },
      {
        fact: "2. 재료 '한 줌' 정의 다름",
        evidence: "유튜버 손 vs 시청자 손 크기 차이. '한 줌'은 30-80g 편차.",
      },
      {
        fact: "3. 광고 제품 우선",
        evidence: "특정 양념·기구 광고 영상은 그 제품 없이 안 됨. 일반 자취엔 불필요.",
      },
      {
        fact: "4. 보기 좋은 = 자취 어려운",
        evidence: "예쁜 플레이팅 = 추가 식기·시간. 실제 자취 가성비 X.",
      },
      {
        fact: "5. '쉬운' 레시피 ≠ 자취 쉬움",
        evidence: "전문 주방 vs 1구 인덕션. 환경 차이 무시.",
      },
    ],
    action: {
      title: "유튜브 자취 똑똑하게",
      rows: [
        { label: "추천", value: "구독자 1-5만 자취 채널 (현실적)" },
        { label: "체크", value: "재료 5개 이하·조리 단계 4단계 이하" },
        { label: "주의", value: "광고 영상 (제품 클로즈업 잦음)" },
      ],
    },
    conclusion: "100만 채널 = 엔터.\n진짜 자취 레시피는 작은 채널.",
    saveHook: "다음 유튜브 보기 전 다시 꺼내보세요.",
  },
  {
    id: "3",
    topic: "마트가\n안 알려주는 5",
    hookSubtitle: "자취 진실 #03",
    hookBody:
      "동선·진열·가격 책정의 비밀.\n자취생 통장이 새는 5가지 함정.",
    setup: {
      title: "대형마트 매출 구조",
      rows: [
        { label: "주력 마진", value: "신선식품 20-30%" },
        { label: "PB 마진", value: "30-40% (상표 무관)" },
        { label: "행사 미끼", value: "1+1·할인은 미끼, 옆에 비싼 거" },
      ],
    },
    facts: [
      {
        fact: "1. 입구에 신선식품 = 충동 구매 유도",
        evidence: "필수품(쌀·물)은 매장 가장 안쪽. 들어가는 동안 다 보고 사게 함.",
      },
      {
        fact: "2. 눈높이 = 가장 비싼 진열대",
        evidence: "가격 비교 단위는 100g·1ml. 위/아래 같은 제품이 30% 쌈.",
      },
      {
        fact: "3. PB 상품 = 일반 브랜드와 같은 공장",
        evidence: "오뚜기·삼양 등이 PB 위탁 생산. 품질 거의 동일, 가격 30% 저렴.",
      },
      {
        fact: "4. 1+1은 유통기한 임박",
        evidence: "재고 회전용. 사놓고 못 쓰면 1+0 = 정가 손해.",
      },
      {
        fact: "5. 카트 크기 = 의도",
        evidence: "큰 카트 = 더 사게. 1인 자취는 바구니로 충분.",
      },
    ],
    action: {
      title: "현명한 자취 장보기",
      rows: [
        { label: "동선", value: "필요한 거만 빠르게 (15분 컷)" },
        { label: "진열", value: "위·아래 가격 비교 필수" },
        { label: "결제 전", value: "1+1 = 다 쓸 수 있나 체크" },
      ],
    },
    conclusion: "마트 = 게임.\n룰 알면 1년 60만원 절약.",
    saveHook: "다음 장보기 전 다시 꺼내보세요.",
  },
  {
    id: "4",
    topic: "한식 5년차도\n모르는 5",
    hookSubtitle: "자취 진실 #04",
    hookBody:
      "엄마는 알지만 자취생은 모르는 것.\n5가지 한식 비밀.",
    setup: {
      title: "자취 한식 흔한 실수",
      rows: [
        { label: "1", value: "양념을 너무 일찍 넣음" },
        { label: "2", value: "찌개 재료 순서 무시" },
        { label: "3", value: "밥물 비율 매번 다름" },
        { label: "4", value: "고기 잡내 제거 생략" },
        { label: "5", value: "참기름·들기름 차이 모름" },
      ],
    },
    facts: [
      {
        fact: "1. 마늘은 항상 마지막에",
        evidence: "처음 넣으면 타서 쓴맛. 80% 익은 후 30초만 익혀야 향 살아남.",
      },
      {
        fact: "2. 김치찌개 김치는 먼저 볶기",
        evidence: "물 붓기 전 5분 볶음 = 깊은 맛. 안 볶으면 신맛만 강함.",
      },
      {
        fact: "3. 햇반보다 밥솥이 1년 -15만원",
        evidence: "햇반 1개 1,500원 vs 즉석밥 비교. 주 7개면 월 4만원.",
      },
      {
        fact: "4. 돼지고기는 우유에 5분",
        evidence: "잡내 제거 + 부드러워짐. 마트 고기도 호텔 맛 가능.",
      },
      {
        fact: "5. 참기름은 마무리, 들기름은 볶기",
        evidence: "참기름 발연점 낮음 → 가열 X. 들기름은 가열 OK.",
      },
    ],
    action: {
      title: "오늘부터 적용",
      rows: [
        { label: "한 끼만이라도", value: "이 5가지 중 하나 적용" },
        { label: "체감", value: "맛 차이 즉시" },
      ],
    },
    conclusion: "엄마 집밥 맛은 디테일에 있다.\n알면 자취 5년차 = 진짜 자취 마스터.",
    saveHook: "한식 만들기 전 다시 꺼내보세요.",
  },
  {
    id: "5",
    topic: "배달앱이\n안 알려주는 5",
    hookSubtitle: "자취 진실 #05",
    hookBody:
      "배달비·최소주문·할인 — 다 계산된 함정.\n5가지 진실.",
    setup: {
      title: "배달앱 매출 구조",
      rows: [
        { label: "수수료", value: "음식점 매출 12-15%" },
        { label: "배달비", value: "사용자 + 음식점 양쪽 부담" },
        { label: "핵심 KPI", value: "사용자당 주문 빈도" },
      ],
    },
    facts: [
      {
        fact: "1. '무료배달' = 음식 가격 +20%",
        evidence: "음식점이 배달비를 메뉴 가격에 흡수. 매장 가격과 비교하면 명확.",
      },
      {
        fact: "2. 최소주문 = 충동 추가 유도",
        evidence: "1만 4천원 최소 → 1만 3천원이면 사이드 추가하게 함.",
      },
      {
        fact: "3. 쿠폰 후 가격 = 정가",
        evidence: "쿠폰은 미리 메뉴 가격 올려두고 할인. 실제 매장가가 더 쌈.",
      },
      {
        fact: "4. 별점·리뷰는 알고리즘 조작",
        evidence: "광고비 낸 가게 우선 노출. 별점 4.9가 진짜 맛집 X.",
      },
      {
        fact: "5. 첫 주문 할인 = 데이터 수집용",
        evidence: "신규 5천원 할인 → 평생 광고 타겟팅 데이터 확보.",
      },
    ],
    action: {
      title: "배달앱 사용 룰",
      rows: [
        { label: "추천", value: "단골 매장 직접 주문 (앱 우회)" },
        { label: "체크", value: "매장 방문 가격과 배달 가격 비교" },
        { label: "주의", value: "최소주문에 끌려 다니지 X" },
      ],
    },
    conclusion: "배달앱 = 마케팅 머신.\n룰 알면 같은 돈으로 더 잘 먹기.",
    saveHook: "배달 시키기 전 다시 꺼내보세요.",
  },
  {
    id: "6",
    topic: "다이어트\n앱 진실",
    hookSubtitle: "자취 진실 #06",
    hookBody:
      "칼로리 계산·식단 추천 앱들의 비밀.\n5가지 함정.",
    setup: {
      title: "다이어트 앱 시장",
      rows: [
        { label: "이용자", value: "20-30대 자취생 80%" },
        { label: "유료 전환", value: "약 5% (95%는 무료)" },
        { label: "성공률", value: "3개월 지속 약 8%" },
      ],
    },
    facts: [
      {
        fact: "1. 칼로리 표기는 ±20% 오차",
        evidence: "사용자 입력 + AI 추정. '햄버거 1개' = 350-700kcal 편차.",
      },
      {
        fact: "2. 추천 식단은 일반론",
        evidence: "성별·나이·운동량 무시한 평균값. 실제 효과 미미.",
      },
      {
        fact: "3. 무료는 데이터 수집용",
        evidence: "입력한 식사·체중·신체 정보 → 광고·제휴 마케팅 활용.",
      },
      {
        fact: "4. '한 달 -5kg' 광고 = 극단 사례",
        evidence: "평균은 -1-2kg. 5kg은 단식·금식 동반.",
      },
      {
        fact: "5. 앱 의존 = 자취 능력 정체",
        evidence: "앱 추천만 따라가면 본인 패턴 학습 X. 3개월 후 앱 끄면 도루묵.",
      },
    ],
    action: {
      title: "앱 똑똑하게 쓰는 법",
      rows: [
        { label: "추천", value: "기록·트래킹용 (참고만)" },
        { label: "주의", value: "추천 식단 맹신 X" },
        { label: "핵심", value: "본인 패턴 학습이 가장 중요" },
      ],
    },
    conclusion: "앱은 도구.\n자취 성공은 본인 습관.",
    saveHook: "다이어트 시작 전 다시 꺼내보세요.",
  },
  {
    id: "7",
    topic: "전기료\n자취 5",
    hookSubtitle: "자취 진실 #07",
    hookBody:
      "냉장고·전자레인지·인덕션 — 자취 전기료의 진실.\n5가지.",
    setup: {
      title: "1인 자취 평균 전기료",
      rows: [
        { label: "월 평균", value: "약 25,000원" },
        { label: "여름", value: "약 35,000원 (에어컨)" },
        { label: "겨울", value: "약 30,000원 (난방기)" },
      ],
    },
    facts: [
      {
        fact: "1. 냉장고 = 전기료 30%",
        evidence: "24시간 가동. 1.5도 올리면 월 -1,500원.",
      },
      {
        fact: "2. 전자레인지가 가스보다 70% 저렴",
        evidence: "데우기 1분 약 20원. 가스 5분 약 80원. 빠른 데움은 전자레인지가 정답.",
      },
      {
        fact: "3. 인덕션 vs 가스 = 전기 더 비싸지만 빠름",
        evidence: "인덕션 1시간 약 300원, 가스 200원. 단 인덕션은 시간 절반.",
      },
      {
        fact: "4. 대기전력 = 월 2-3천원",
        evidence: "TV·셋톱·공유기 24시간. 멀티탭으로 한 번에 OFF.",
      },
      {
        fact: "5. 냉동실 가득 채우면 효율 ↑",
        evidence: "공기 데우는 게 더 비쌈. 냉동 식품으로 채워두면 -10% 전기료.",
      },
    ],
    action: {
      title: "자취 전기 절약",
      rows: [
        { label: "냉장고", value: "온도 적정 + 정리 (월 -2천원)" },
        { label: "전자레인지", value: "1분 컷 데우기 활용" },
        { label: "멀티탭", value: "외출 시 OFF (월 -3천원)" },
      ],
    },
    conclusion: "전기료도 자취 가성비.\n월 -5천원 = 1년 6만원.",
    saveHook: "전기료 청구 받기 전 다시 꺼내보세요.",
  },
  {
    id: "8",
    topic: "주말 보상\n역효과",
    hookSubtitle: "자취 진실 #08",
    hookBody:
      "주중 자취·주말 보상 외식?\n오히려 통장·체중 더 망함.",
    setup: {
      title: "흔한 자취 패턴",
      rows: [
        { label: "월-금", value: "한 끼 자취·도시락 (절약 모드)" },
        { label: "토-일", value: "외식·배달·디저트 (보상 모드)" },
        { label: "결과", value: "주중 절약 < 주말 폭주" },
      ],
    },
    facts: [
      {
        fact: "1. 주말 한 끼 = 평일 5끼 비용",
        evidence: "외식 1.5만원 × 6끼 = 9만원. 평일 자취 5일 식비와 동일.",
      },
      {
        fact: "2. '보상 심리'는 -150% 효과",
        evidence: "절약 동기 약화 + 다음 주중 의지 ↓ + 폭식 패턴 고착.",
      },
      {
        fact: "3. 주말 체중 +1.5kg",
        evidence: "탄수·지방 + 알코올 + 디저트 = 평균 +1.5kg, 주중 회복 못 함.",
      },
      {
        fact: "4. 외식 친구도 영향받음",
        evidence: "친구 패턴 흡수 → 같은 시간·메뉴·빈도. 자취 의지 ↓.",
      },
      {
        fact: "5. 진짜 보상 = 좋은 한 끼",
        evidence: "주말 1회 정성 자취 (시간 + 재료 투자) = 외식보다 만족·기분 ↑.",
      },
    ],
    action: {
      title: "지속 가능한 패턴",
      rows: [
        { label: "주중", value: "한 끼 자취 + 도시락" },
        { label: "주말", value: "외식 1회 + 자취 정성 한 끼" },
        { label: "보상", value: "사람과 시간으로, 음식 X" },
      ],
    },
    conclusion: "주말 폭주 = 주중 자취 무효.\n균형이 진짜 자취.",
    saveHook: "다음 주말 외식 결정 전 다시 꺼내보세요.",
  },
];

export function findTruthPost(id: string): TruthPost | undefined {
  return TRUTH_POSTS.find((p) => p.id === id);
}
