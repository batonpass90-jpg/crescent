/**
 * 주간 식단표 — 월요일 게시용 ("이번 주는 X 위주" 형식).
 * 자취생을 위한 일주일치 메뉴 + 장보기 + 보관 가이드.
 */

export interface WeeklyMeal {
  day: string; // "월", "화" 등
  meal: string;
}

export interface ShoppingItem {
  item: string;
  price: string;
}

export interface WeeklyMenu {
  id: string;
  theme: string; // "단백질 위주" — 시리즈 헤드라인용
  description: string; // 1줄 설명 (커버 본문)
  weekdays: WeeklyMeal[]; // 월~금 5일
  weekend: WeeklyMeal[]; // 토~일 2일
  weekendNote?: string; // 주말 캘러우트
  shopping: ShoppingItem[]; // 5~7개 재료 + 가격
  budget: string; // "약 2만 8천원"
  storageTip: string; // 보관 팁
  photoQuery: string; // 커버 사진 키워드
}

export const WEEKLY_MENUS: WeeklyMenu[] = [
  {
    id: "1",
    theme: "단백질 위주",
    description: "야근 많은 주엔 단백질이 제일 먼저 부족해진다",
    weekdays: [
      { day: "월", meal: "닭가슴살 덮밥" },
      { day: "화", meal: "두부조림 + 현미밥" },
      { day: "수", meal: "계란말이 + 김 + 미역국" },
      { day: "목", meal: "연어샐러드 (마트 팩)" },
      { day: "금", meal: "콩나물국밥 + 계란" },
    ],
    weekend: [
      { day: "토", meal: "외식 또는 자유식" },
      { day: "일", meal: "남은 재료 정리 — 비빔밥 등" },
    ],
    weekendNote: "주말은 외식 1번 + 자유식 OK. 무리하지 마.",
    shopping: [
      { item: "닭가슴살 200g x 3팩", price: "8,000원" },
      { item: "두부 1모", price: "2,500원" },
      { item: "계란 10구", price: "4,500원" },
      { item: "콩나물 한 봉", price: "1,500원" },
      { item: "현미밥 즉석 5개", price: "6,000원" },
      { item: "연어 100g 마트팩", price: "5,500원" },
    ],
    budget: "약 2만 8천원",
    storageTip:
      "닭가슴살은 한꺼번에 삶아 1회분씩 나눠 냉장. 3일 안에 다 먹어.",
    photoQuery: "weekly meal prep protein",
  },
  {
    id: "2",
    theme: "다이어트",
    description: "체중 감량 중에도 든든하게 — 한 끼 400kcal 이하",
    weekdays: [
      { day: "월", meal: "닭가슴살 샐러드" },
      { day: "화", meal: "두부 김치찌개 (밥 1/2공기)" },
      { day: "수", meal: "그릭요거트 과일볼" },
      { day: "목", meal: "양배추쌈 + 계란말이" },
      { day: "금", meal: "오트밀 단백질 죽" },
    ],
    weekend: [
      { day: "토", meal: "고구마 + 삶은 계란 2개" },
      { day: "일", meal: "외식 1번 (치팅 OK)" },
    ],
    weekendNote: "주 1회 치팅으로 의지력 유지. 폭식 방지.",
    shopping: [
      { item: "닭가슴살 6팩", price: "16,000원" },
      { item: "양배추 1통", price: "3,000원" },
      { item: "그릭요거트 4개", price: "12,000원" },
      { item: "오트밀 500g", price: "4,500원" },
      { item: "고구마 1kg", price: "5,000원" },
    ],
    budget: "약 4만 5천원",
    storageTip:
      "양배추는 4등분 후 비닐랩으로 감싸 냉장. 한 통이 일주일 가성비 끝판왕.",
    photoQuery: "diet meal plan low calorie",
  },
  {
    id: "3",
    theme: "5천원 예산",
    description: "한 끼 5천원 — 자취 가성비 식단 일주일",
    weekdays: [
      { day: "월", meal: "김치볶음밥 + 계란프라이" },
      { day: "화", meal: "콩나물국밥" },
      { day: "수", meal: "라볶이 (떡 + 라면)" },
      { day: "목", meal: "참치마요 덮밥" },
      { day: "금", meal: "김치찌개 + 밥" },
    ],
    weekend: [
      { day: "토", meal: "라면 + 계란 (그래도 OK)" },
      { day: "일", meal: "장보기 + 다음 주 준비" },
    ],
    weekendNote: "토요일은 정직한 라면. 일요일은 장보기 + 밥솥에 밥 짓기.",
    shopping: [
      { item: "쌀 4kg", price: "12,000원" },
      { item: "묵은김치 1kg", price: "5,000원" },
      { item: "계란 30구", price: "12,000원" },
      { item: "참치캔 4개", price: "6,000원" },
      { item: "라면 5봉", price: "4,500원" },
      { item: "떡 + 어묵 + 콩나물", price: "5,000원" },
    ],
    budget: "약 4만 4천원 (한 끼 약 4,400원)",
    storageTip:
      "쌀은 진공 보관, 김치는 김치냉장고. 한 번 사면 한 달 거뜬.",
    photoQuery: "korean budget meal cheap rice",
  },
  {
    id: "4",
    theme: "야근 주간",
    description: "퇴근 늦은 주 — 모든 끼니 10분 이내",
    weekdays: [
      { day: "월", meal: "계란후라이덮밥 (10분)" },
      { day: "화", meal: "냉동밥 볶음밥 (10분)" },
      { day: "수", meal: "두부 샐러드 (5분)" },
      { day: "목", meal: "전자레인지 달걀찜 (8분)" },
      { day: "금", meal: "참치마요 덮밥 (5분)" },
    ],
    weekend: [
      { day: "토", meal: "낮잠 + 늦은 점심 (배달 OK)" },
      { day: "일", meal: "다음 주 식재료 사전 준비" },
    ],
    weekendNote: "토요일은 회복 우선. 일요일 30분만 다음 주 준비.",
    shopping: [
      { item: "냉동밥 5개", price: "5,000원" },
      { item: "두부 2모", price: "3,000원" },
      { item: "계란 30구", price: "12,000원" },
      { item: "참치캔 4개", price: "6,000원" },
      { item: "냉동 야채믹스", price: "3,500원" },
      { item: "양상추·드레싱", price: "4,000원" },
    ],
    budget: "약 3만 3천원",
    storageTip:
      "냉동밥 + 냉동 야채믹스 = 야근 식단 최강 조합. 항상 비축.",
    photoQuery: "quick easy meals weeknight",
  },
  {
    id: "5",
    theme: "한식 집밥",
    description: "엄마 집밥 그리울 때 — 정통 한식 일주일",
    weekdays: [
      { day: "월", meal: "김치찌개 + 밥" },
      { day: "화", meal: "된장찌개 + 멸치볶음" },
      { day: "수", meal: "계란말이 + 미역국" },
      { day: "목", meal: "비빔밥 (남은 반찬 활용)" },
      { day: "금", meal: "제육볶음 + 상추쌈" },
    ],
    weekend: [
      { day: "토", meal: "삼겹살 (혼술 가능)" },
      { day: "일", meal: "잔치국수 (간단하게)" },
    ],
    weekendNote: "토요일 혼술 한식 + 일요일은 가볍게 면 요리.",
    shopping: [
      { item: "묵은김치 500g", price: "3,000원" },
      { item: "된장 1kg", price: "5,000원" },
      { item: "삼겹살 600g", price: "12,000원" },
      { item: "제육용 돼지고기", price: "8,000원" },
      { item: "상추·깻잎", price: "3,500원" },
      { item: "멸치 + 미역", price: "4,000원" },
    ],
    budget: "약 3만 5천원",
    storageTip:
      "삼겹살은 1회분씩 소분 냉동. 멸치볶음은 한 번 만들면 일주일 반찬.",
    photoQuery: "korean home cooked meal banchan",
  },
  {
    id: "6",
    theme: "외식 줄이기",
    description: "외식 빈도 절반 — 집밥에 외식 같은 메뉴",
    weekdays: [
      { day: "월", meal: "닭가슴살 덮밥 (집)" },
      { day: "화", meal: "토마토 파스타 (집)" },
      { day: "수", meal: "참치마요 덮밥 (집)" },
      { day: "목", meal: "외식 1회 — 친구 약속 OK" },
      { day: "금", meal: "오야코동 (집)" },
    ],
    weekend: [
      { day: "토", meal: "외식 또는 배달 (한 번 더)" },
      { day: "일", meal: "비빔밥 잔반 정리" },
    ],
    weekendNote: "외식 주 2회까지는 OK. 5만원 이상은 NO.",
    shopping: [
      { item: "닭가슴살 4팩", price: "12,000원" },
      { item: "스파게티 면", price: "3,500원" },
      { item: "토마토소스", price: "4,500원" },
      { item: "참치캔 4개", price: "6,000원" },
      { item: "달걀 10구", price: "4,500원" },
      { item: "양파·마늘", price: "3,000원" },
    ],
    budget: "약 3만 3천원 + 외식 2회",
    storageTip:
      "토마토소스는 한 번 사면 4-5끼 쓸 수 있어. 작은 용기에 1회분씩 소분.",
    photoQuery: "homemade italian korean meal",
  },
  {
    id: "7",
    theme: "초보 자취",
    description: "자취 시작 1개월 — 실패 없는 일주일 메뉴",
    weekdays: [
      { day: "월", meal: "계란후라이덮밥" },
      { day: "화", meal: "냉동 만두 굽기" },
      { day: "수", meal: "참치마요 덮밥" },
      { day: "목", meal: "전자레인지 달걀찜" },
      { day: "금", meal: "라면 + 계란 + 김치 (정직)" },
    ],
    weekend: [
      { day: "토", meal: "외식 또는 배달 (보상)" },
      { day: "일", meal: "다음 주 장보기" },
    ],
    weekendNote: "처음엔 부담 없는 메뉴부터. 실패해도 OK.",
    shopping: [
      { item: "쌀 2kg", price: "6,000원" },
      { item: "달걀 30구", price: "12,000원" },
      { item: "참치캔 4개", price: "6,000원" },
      { item: "냉동 만두 1봉", price: "5,500원" },
      { item: "라면 5봉", price: "4,500원" },
      { item: "김치 500g", price: "5,000원" },
    ],
    budget: "약 3만 9천원",
    storageTip:
      "초보는 냉동 만두 + 즉석밥 비축. 진짜 못하겠는 날 비상식.",
    photoQuery: "easy beginner korean meal",
  },
  {
    id: "8",
    theme: "고단백 다이어트",
    description: "근손실 X — 단백질 챙기며 체중 감량",
    weekdays: [
      { day: "월", meal: "닭가슴살 샐러드" },
      { day: "화", meal: "두부 오믈렛 + 토스트" },
      { day: "수", meal: "오트밀 단백질 죽" },
      { day: "목", meal: "닭가슴살 김치볶음밥 (밥 1/2)" },
      { day: "금", meal: "두부 샐러드 + 그릭요거트" },
    ],
    weekend: [
      { day: "토", meal: "치팅: 외식 1회" },
      { day: "일", meal: "단호박 스프 + 계란" },
    ],
    weekendNote: "주 1회 치팅 OK. 폭식만 피하자.",
    shopping: [
      { item: "닭가슴살 8팩", price: "20,000원" },
      { item: "두부 3모", price: "5,000원" },
      { item: "그릭요거트 5개", price: "15,000원" },
      { item: "오트밀 500g", price: "4,500원" },
      { item: "단호박 1개", price: "4,000원" },
      { item: "양상추·토마토·오이", price: "6,000원" },
    ],
    budget: "약 5만 5천원",
    storageTip:
      "닭가슴살은 한꺼번에 삶아 냉동 — 다이어트 핵심 미리 조리.",
    photoQuery: "high protein diet meal korean",
  },
];

export function findWeeklyMenu(id: string): WeeklyMenu | undefined {
  return WEEKLY_MENUS.find((m) => m.id === id);
}
