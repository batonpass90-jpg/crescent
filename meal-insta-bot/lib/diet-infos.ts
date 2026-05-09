/**
 * 식단 정보 — 화·목 게시용 (영양·식습관·자취 식비 등 실용 가이드).
 * 영양학적으로 정확하고 자취생이 진짜 궁금해하는 주제만.
 */

export interface InfoRow {
  label: string;
  value: string;
}

export interface DietInfo {
  id: string;
  topic: string; // 시리즈 헤드라인용 ("단백질, 얼마나?")
  hookSubtitle: string; // 표지 subtitle ("자취생 영양 가이드")
  hookBody: string; // 표지 body — 페인+약속
  criteria: { title: string; rows: InfoRow[] }; // 02. 기준·수치
  sources: { title: string; rows: InfoRow[] }; // 03. 식재료별 정보
  application: { title: string; rows: InfoRow[] }; // 04. 자취 적용
  mistakeCallout: string; // 05. 흔한 실수 (callout)
  conclusion: string; // 06. 한 줄 결론 (callout)
  photoQuery: string;
}

export const DIET_INFOS: DietInfo[] = [
  {
    id: "1",
    topic: "단백질,\n얼마나?",
    hookSubtitle: "자취 영양 가이드 #01",
    hookBody:
      "보충제 안 사도 일반식으로 충분.\n매끼 손바닥 한 번씩만 챙기면 끝.",
    criteria: {
      title: "기준",
      rows: [
        { label: "체중당", value: "0.8-1.2g/kg" },
        { label: "60kg 기준", value: "약 50-70g" },
        { label: "70kg 기준", value: "약 60-85g" },
        { label: "운동일", value: "위 범위 상한" },
      ],
    },
    sources: {
      title: "이렇게 채워",
      rows: [
        { label: "계란 1개", value: "단백질 6g" },
        { label: "두부 반 모", value: "10g" },
        { label: "닭가슴살 100g", value: "23g" },
        { label: "우유 200ml", value: "6g" },
        { label: "참치캔 작은 거", value: "13g" },
      ],
    },
    application: {
      title: "자취 적용",
      rows: [
        { label: "추천", value: "매끼 손바닥 크기\n계란·두부·닭가슴살 로테이션" },
        { label: "주의", value: "보충제 의존 X\n프로틴바만 먹기 X" },
      ],
    },
    mistakeCallout:
      "실수 — 보충제만 먹는다. 일반식 단백질이 더 흡수 잘 됨.",
    conclusion: "보충제 살 돈으로 두부 한 모.\n매끼 한 번 챙기면 충분.",
    photoQuery: "protein sources korean food",
  },
  {
    id: "2",
    topic: "자취\n영양 결핍",
    hookSubtitle: "자취 영양 가이드 #02",
    hookBody:
      "라면·즉석식만 먹는 자취생,\n3개월 안에 신호 나타남.",
    criteria: {
      title: "흔한 결핍",
      rows: [
        { label: "단백질", value: "근손실·머리카락 빠짐" },
        { label: "철분", value: "어지럼·피로·창백" },
        { label: "비타민D", value: "우울·뼈약화" },
        { label: "오메가3", value: "집중력·기분 저하" },
        { label: "식이섬유", value: "변비·장 건강 악화" },
      ],
    },
    sources: {
      title: "이걸로 보충",
      rows: [
        { label: "단백질", value: "계란·두부·닭가슴살" },
        { label: "철분", value: "소고기·시금치·콩" },
        { label: "비타민D", value: "햇볕 15분/주 3회" },
        { label: "오메가3", value: "고등어캔·견과류" },
        { label: "식이섬유", value: "사과·통곡물·채소" },
      ],
    },
    application: {
      title: "주 1회 체크",
      rows: [
        { label: "꼭 챙길 것", value: "단백질·채소 매일\n과일 주 3회" },
        { label: "피할 것", value: "라면 매일 X\n탄산·과자 의존 X" },
      ],
    },
    mistakeCallout:
      "주의 — 자취 5년차 흔한 패턴: 라면 + 즉석식 → 빈혈·만성피로.",
    conclusion: "달걀 1개·시금치 한 줌·과일 1개.\n매일 이 3가지가 시작.",
    photoQuery: "balanced korean meal nutrition",
  },
  {
    id: "3",
    topic: "식비\n2만원 줄이기",
    hookSubtitle: "자취 식비 가이드 #03",
    hookBody:
      "월 식비 30 → 28만원, 1년에 24만원 절약.\n6단계 루틴.",
    criteria: {
      title: "현실 식비 (1인)",
      rows: [
        { label: "외식만", value: "월 60-80만원" },
        { label: "외식+자취", value: "월 35-50만원" },
        { label: "자취 위주", value: "월 25-35만원" },
        { label: "초절약", value: "월 15-20만원" },
      ],
    },
    sources: {
      title: "6단계 절약법",
      rows: [
        { label: "1. 장보기", value: "주 1회·5만원 한도" },
        { label: "2. 미리 조리", value: "주말 2시간 = 평일 3끼" },
        { label: "3. 냉동 활용", value: "냉동밥·야채믹스·만두" },
        { label: "4. 도시락", value: "점심 외식 → 5천원 절약/일" },
        { label: "5. 배달 X", value: "배달비 4천원 = 자취 한 끼" },
        { label: "6. 기록", value: "가계부 앱 — 식비 가시화" },
      ],
    },
    application: {
      title: "주 1회 장보기",
      rows: [
        { label: "필수 (5만원)", value: "쌀·계란·두부·김치\n채소 2가지·단백질 1팩" },
        { label: "선택 (별도)", value: "과일·간식·외식용" },
      ],
    },
    mistakeCallout:
      "실수 — 매일 편의점. 한 끼 5천원 × 30일 = 15만원 더.",
    conclusion: "주 1회 장보기 + 도시락 = 월 10만원 절약.\n1년이면 120만원.",
    photoQuery: "korean grocery shopping budget",
  },
  {
    id: "4",
    topic: "라면만\n먹으면",
    hookSubtitle: "자취 영양 가이드 #04",
    hookBody:
      "라면 매일 X. 일주일에 2번까지는 OK.\n그 외엔 진짜 한 끼.",
    criteria: {
      title: "라면 1봉의 진실",
      rows: [
        { label: "칼로리", value: "약 500-550 kcal" },
        { label: "나트륨", value: "1,800-2,000mg (일일 권장 75%)" },
        { label: "단백질", value: "약 10g (부족)" },
        { label: "지방", value: "16-20g (포화지방 ↑)" },
        { label: "식이섬유", value: "거의 0" },
      ],
    },
    sources: {
      title: "라면 +α",
      rows: [
        { label: "계란 1개", value: "+단백질 6g · +70 kcal" },
        { label: "콩나물 한 줌", value: "+섬유·해독 효과" },
        { label: "두부 1/3모", value: "+단백질 7g · +50 kcal" },
        { label: "치즈 1장", value: "+칼슘·풍미" },
      ],
    },
    application: {
      title: "라면 빈도",
      rows: [
        { label: "추천", value: "주 2회 + 토핑 추가" },
        { label: "주의", value: "매일 X · 국물 다 마시지 X" },
      ],
    },
    mistakeCallout:
      "실수 — 라면 + 밥 + 김치 = 나트륨 폭탄. 둘 중 하나만.",
    conclusion: "라면 자체가 문제 X.\n매일 먹는 게 문제.",
    photoQuery: "korean ramen with toppings",
  },
  {
    id: "5",
    topic: "야식\n끊는 법",
    hookSubtitle: "자취 식습관 가이드 #05",
    hookBody:
      "야식 욕구 = 가짜 배고픔 70%.\n4가지 신호로 구분.",
    criteria: {
      title: "야식 욕구 분석",
      rows: [
        { label: "스트레스", value: "단맛·기름진 거 끌림" },
        { label: "수면 부족", value: "탄수화물 갈망 ↑" },
        { label: "탈수", value: "물 부족 → 배고픔 착각" },
        { label: "낮 식사 부족", value: "보상 심리 폭식" },
      ],
    },
    sources: {
      title: "야식 대체 옵션",
      rows: [
        { label: "물 500ml", value: "5분 후에도 배고프면 → 진짜" },
        { label: "그릭요거트", value: "단백질 + 만족감" },
        { label: "찐 계란", value: "70 kcal · 포만감 ↑" },
        { label: "사과 1개", value: "당분 + 식이섬유" },
        { label: "녹차·홍차", value: "심리적 만족" },
      ],
    },
    application: {
      title: "21일 루틴",
      rows: [
        { label: "1주차", value: "야식 욕구 → 물 먼저\n그래도 배고프면 야식 OK" },
        { label: "2-3주차", value: "야식 횟수 절반\n저녁 단백질 늘리기" },
      ],
    },
    mistakeCallout:
      "실수 — 자기 직전 폭식. 위장 부담 + 수면 질 ↓ + 다음날 식욕 폭주.",
    conclusion: "물 한 컵 → 5분 → 그래도 배고프면 OK.\n7할은 가짜 배고픔.",
    photoQuery: "healthy late night snack",
  },
  {
    id: "6",
    topic: "외식 vs\n집밥",
    hookSubtitle: "자취 비교 가이드 #06",
    hookBody:
      "외식 1끼 = 집밥 3끼 비용.\n영양은 집밥 압승.",
    criteria: {
      title: "1끼 비용·영양",
      rows: [
        { label: "외식 평균", value: "8,000-12,000원" },
        { label: "집밥 평균", value: "2,500-4,000원" },
        { label: "한 달 차이", value: "월 18-24만원" },
        { label: "1년 차이", value: "약 250만원" },
      ],
    },
    sources: {
      title: "영양 비교",
      rows: [
        { label: "외식", value: "나트륨 ↑·트랜스지방·MSG" },
        { label: "집밥", value: "재료 통제·신선·간 조절" },
        { label: "외식 단백질", value: "고기 비중 ↑ → 비싸진 부분" },
        { label: "집밥 단백질", value: "계란·두부 → 가성비 ↑" },
      ],
    },
    application: {
      title: "추천 비율",
      rows: [
        { label: "추천", value: "주 5일 집밥 + 주 2회 외식" },
        { label: "비추천", value: "주 5일 외식\n매일 배달" },
      ],
    },
    mistakeCallout:
      "실수 — 시간 없다고 매일 외식. 집밥 10분이면 충분한 메뉴 많음.",
    conclusion: "주 2회 외식은 보상.\n나머지는 집밥으로 250만원 아낌.",
    photoQuery: "korean home cooked vs restaurant",
  },
  {
    id: "7",
    topic: "마트\n영양표시",
    hookSubtitle: "자취 식재료 가이드 #07",
    hookBody:
      "마트 갈 때 0.5초 체크.\n3가지 숫자만 보면 끝.",
    criteria: {
      title: "꼭 봐야 할 3가지",
      rows: [
        { label: "1회분 (g)", value: "전체 양 ÷ 1회분 횟수 확인" },
        { label: "나트륨", value: "1회분 600mg ↑ = 짠 음식" },
        { label: "당류", value: "1회분 10g ↑ = 단 음식" },
      ],
    },
    sources: {
      title: "함정",
      rows: [
        { label: "1회분 속임수", value: "패키지 전체 X\n1회분 X 횟수 = 실제 칼로리" },
        { label: "트랜스지방 0", value: "0.2g 미만은 0으로 표기" },
        { label: "유기농 ≠ 저칼로리", value: "유기농 과자도 칼로리 동일" },
      ],
    },
    application: {
      title: "마트 빠른 판별",
      rows: [
        { label: "건강식", value: "단백질 ÷ 칼로리 = 0.1↑" },
        { label: "주의", value: "당류 + 나트륨 둘 다 높음" },
      ],
    },
    mistakeCallout:
      "실수 — 패키지 앞면 (저지방·유기농)만 보고 구매. 뒷면 영양표시가 진짜.",
    conclusion: "1회분·나트륨·당류 — 3개만.\n0.5초면 충분.",
    photoQuery: "nutrition label korean grocery",
  },
  {
    id: "8",
    topic: "다이어트\n칼로리",
    hookSubtitle: "자취 다이어트 가이드 #08",
    hookBody:
      "5kg 빼려면 35,000 kcal 줄여야.\n1일 -500이면 70일.",
    criteria: {
      title: "기본 공식",
      rows: [
        { label: "체중 1kg", value: "약 7,000 kcal" },
        { label: "5kg 감량", value: "총 35,000 kcal" },
        { label: "1일 -500", value: "70일 = 약 2.5개월" },
        { label: "1일 -300", value: "115일 = 약 4개월" },
      ],
    },
    sources: {
      title: "-500 kcal 만들기",
      rows: [
        { label: "음료 줄이기", value: "콜라·라떼 → 물 (-200)" },
        { label: "야식 OFF", value: "라면 1봉 = 500 kcal" },
        { label: "한 끼 가볍게", value: "샐러드 한 끼 = -300" },
        { label: "운동", value: "걷기 30분 = -150" },
      ],
    },
    application: {
      title: "추천 vs 비추천",
      rows: [
        { label: "추천", value: "단백질 유지 + 탄수 줄이기\n주 0.5kg 이하 감량" },
        { label: "비추천", value: "원푸드 다이어트\n주 2kg 이상 급감" },
      ],
    },
    mistakeCallout:
      "실수 — 굶다가 폭식. 1주일에 0.5kg 천천히가 정답.",
    conclusion: "5kg = 70일.\n극단적 X, 매일 -500 kcal.",
    photoQuery: "diet meal calories tracking",
  },
];

export function findDietInfo(id: string): DietInfo | undefined {
  return DIET_INFOS.find((d) => d.id === id);
}
