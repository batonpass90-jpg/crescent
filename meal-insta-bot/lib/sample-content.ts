import type { CardNewsContent, ContentCategory } from "./content-types";

export const SAMPLE_CONTENT: CardNewsContent = {
  title: "월요일은 김치볶음밥",
  cards: [
    {
      headline: "월요일은\n김치볶음밥",
      body: "10분 컷, 1구 인덕션 OK\n묵은김치 처리 + 찬밥 처리 한 번에",
      image_concept: "kimchi fried rice in a white bowl, top down, warm",
      subtitle: "오늘의 한 끼 · 月",
    },
    {
      headline: "재료",
      subtitle: "1인분 · 마트 5천원 컷",
      body: "전부 마트에서 한 봉지에 살 수 있는 것들로만.",
      rows: [
        { label: "묵은김치", value: "한 줌 (약 80g)" },
        { label: "찬밥", value: "한 공기 (200g)" },
        { label: "계란", value: "1개" },
        { label: "참기름", value: "1티스푼" },
        { label: "통깨·식용유", value: "약간" },
      ],
      image_concept: "ingredients laid out flat",
    },
    {
      headline: "조리 STEP",
      subtitle: "총 10분 · 1구 인덕션",
      body: "",
      steps: [
        "김치 잘게 썰어 식용유에 2분 볶기 (수분 날리기)",
        "찬밥 넣고 잘 섞으면서 살짝 누르기 (3분)",
        "참기름·통깨 마무리, 불 끄기",
        "옆에서 계란프라이 1개 따로 부치기",
      ],
      callout: {
        tone: "tip",
        text: "김치 너무 시면 설탕 한 꼬집.\n김칫국물 살짝 넣으면 깊은 맛.",
      },
      image_concept: "frying pan close up, kimchi rice cooking",
    },
    {
      headline: "체크",
      subtitle: "이런 분께 추천",
      body: "",
      rows: [
        { label: "추천", value: "묵은김치 처리\n찬밥 남은 자취생\n빠른 한 끼 필요" },
        { label: "비추천", value: "위장이 약한 날\n매운 거 못 먹는 사람\n다이어트 강박 중" },
      ],
      image_concept: "comparison",
    },
    {
      headline: "응용",
      subtitle: "한 레시피로 일주일",
      body: "응용 3가지로 일주일 버티기.",
      rows: [
        { label: "치즈볶음밥", value: "마지막에 슬라이스 치즈 1장" },
        { label: "참치볶음밥", value: "참치캔 반 통 + 마요 1스푼" },
        { label: "스팸볶음밥", value: "스팸 다이스로 썰어 먼저 볶기" },
      ],
      image_concept: "variations",
    },
    {
      headline: "영양",
      subtitle: "1인분 기준 · 약",
      body: "",
      rows: [
        { label: "칼로리", value: "약 520 kcal" },
        { label: "탄수화물", value: "75g" },
        { label: "단백질", value: "16g" },
        { label: "지방", value: "15g" },
        { label: "나트륨", value: "1,400mg (높음)" },
      ],
      callout: {
        tone: "warn",
        text: "김치 한 번 헹궈 쓰거나 양 절반으로.\n두부 반 모 추가하면 단백질 +10g.",
      },
      image_concept: "nutrition breakdown table",
    },
    {
      headline: "남으면",
      subtitle: "보관 + 다시 먹기",
      body: "",
      rows: [
        { label: "냉장", value: "최대 2일" },
        { label: "냉동", value: "최대 2주 (1회분씩 소분)" },
        { label: "재가열", value: "전자레인지 1분 30초\n또는 팬에 30초 다시 볶기" },
        { label: "절대 X", value: "실온 4시간↑ — 식중독 위험" },
      ],
      callout: {
        tone: "tip",
        text: "처음부터 2인분 만들면 다음 끼니 3분 컷.\n자취 가성비 최강 루틴.",
      },
      image_concept: "storage and reheating",
    },
    {
      headline: "혼자서도\n잘 먹기",
      subtitle: "자취인 식단앱 · 소요",
      body: "",
      rows: [
        { label: "레시피", value: "혼자 먹는 한 끼 필요하면" },
        { label: "장보기", value: "1인분 장보기 막막하면" },
        { label: "영양분석", value: "잘 먹고 있나 궁금하면" },
        { label: "빠른요리", value: "귀찮음에 빠른 끼니 필요하면" },
      ],
      callout: {
        tone: "tip",
        text: "소요 앱에서\n오늘 먹은 음식 업로드해보세요.",
      },
      image_concept: "soyo app feature CTA",
    },
  ],
  caption: `김치 신 거 처리하기 진짜 좋은 메뉴.
집에 있는 재료로 10분 컷 가능해.

▷ 재료 (1인분)
- 묵은김치 한 줌
- 찬밥 한 공기
- 계란 1개
- 참기름·통깨

▷ 만드는 법
1. 김치 잘게 썰어서 기름에 볶기
2. 밥 넣고 잘 섞기 (살짝 눌리게)
3. 참기름·통깨 마무리
4. 옆에 계란프라이 올리면 끝

▷ 자취 팁
김치 너무 시면 설탕 한 꼬집.
김칫국물 살짝 넣으면 더 깊은 맛.`,
  hashtags: [
    "#자취식단",
    "#자취요리",
    "#김치볶음밥",
    "#1인가구",
    "#자취일상",
    "#10분요리",
    "#집밥",
  ],
};

export const SAMPLE_BY_CATEGORY: Record<ContentCategory, CardNewsContent> = {
  today_meal: SAMPLE_CONTENT,
  weekly_menu: {
    title: "이번 주는 단백질 위주",
    cards: [
      {
        headline: "단백질\n챙기는 한 주",
        body: "야근 많은 주엔 단백질이 제일 먼저 부족해진다",
        image_concept: "weekly meal plan flatlay",
        subtitle: "이번 주 식단표",
      },
      {
        headline: "주중 식단",
        subtitle: "월·화·수",
        body: "",
        rows: [
          { label: "월", value: "닭가슴살 덮밥" },
          { label: "화", value: "두부조림 + 현미밥" },
          { label: "수", value: "계란말이 + 김 + 미역국" },
        ],
        image_concept: "weekday meals",
      },
      {
        headline: "주말 직전",
        subtitle: "목·금",
        body: "",
        rows: [
          { label: "목", value: "연어샐러드 (마트 팩 활용)" },
          { label: "금", value: "콩나물국밥 + 계란" },
        ],
        callout: {
          tone: "tip",
          text: "주말은 외식 1번 + 자유식 OK. 무리하지 마.",
        },
        image_concept: "thursday friday meals",
      },
      {
        headline: "장보기",
        subtitle: "약 2만 8천원 예산",
        body: "",
        rows: [
          { label: "닭가슴살 200g x 3팩", value: "8,000원" },
          { label: "두부 1모", value: "2,500원" },
          { label: "계란 10구", value: "4,500원" },
          { label: "콩나물 한 봉", value: "1,500원" },
          { label: "현미밥 즉석 5개", value: "6,000원" },
        ],
        image_concept: "shopping list",
      },
      {
        headline: "보관 팁",
        subtitle: "한 번에 사서 나눠 쓰기",
        body: "",
        callout: {
          tone: "tip",
          text: "닭가슴살은 한꺼번에 삶아 1회분씩 나눠 냉장. 3일 안에 다 먹어.",
        },
        rows: [
          { label: "냉장", value: "삶은 닭가슴살, 두부 (3일)" },
          { label: "냉동", value: "안 먹을 분량 미리 소분 후 냉동" },
        ],
        image_concept: "storage tips",
      },
    ],
    caption: "이번 주는 단백질 한번 챙겨보자.",
    hashtags: ["#자취식단", "#주간식단", "#단백질", "#1인가구"],
  },
  diet_info: {
    title: "자취생 단백질, 얼마나 먹어야 해?",
    cards: [
      {
        headline: "단백질\n얼마나 먹어야?",
        body: "보충제 없이 일반식으로 충분한지 정리",
        image_concept: "protein sources flatlay",
        subtitle: "식단 정보",
      },
      {
        headline: "기준",
        subtitle: "체중 1kg당 0.8-1.2g",
        body: "",
        rows: [
          { label: "60kg 기준", value: "약 50-70g" },
          { label: "70kg 기준", value: "약 60-85g" },
          { label: "운동하는 날", value: "위 범위의 상한" },
        ],
        image_concept: "protein chart",
      },
      {
        headline: "이렇게 채워",
        subtitle: "흔한 식재료 단백질량",
        body: "",
        rows: [
          { label: "계란 1개", value: "6g" },
          { label: "두부 반 모", value: "10g" },
          { label: "닭가슴살 100g", value: "23g" },
          { label: "우유 200ml", value: "6g" },
          { label: "참치캔 작은 거", value: "13g" },
        ],
        image_concept: "protein examples",
      },
      {
        headline: "자취 적용",
        subtitle: "매끼 손바닥 크기 한 번",
        body: "",
        rows: [
          { label: "추천", value: "매끼 손바닥 크기 단백질\n계란·두부·닭가슴살 로테이션" },
          { label: "주의", value: "보충제 의존 금물\n프로틴바만 먹기 X" },
        ],
        image_concept: "practical application",
      },
      {
        headline: "한 줄 결론",
        subtitle: "지속 가능한 게 답",
        body: "",
        callout: {
          tone: "tip",
          text: "보충제 살 돈으로 두부 한 모 더 사자. 매끼 한 번 챙기면 충분.",
        },
        image_concept: "conclusion",
      },
    ],
    caption: "단백질 보충제 살 돈으로 두부 한 모 더 사자.",
    hashtags: ["#자취식단", "#단백질", "#영양정보", "#1인가구"],
  },
};
