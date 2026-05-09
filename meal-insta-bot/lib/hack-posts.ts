/**
 * 자취 꿀팁 / 실용 가이드 — 저장 유도형.
 * "유통기한 임박 처리법", "냉장고 파먹기 5단계" 등.
 * 알고리즘 친화: 저장 → 시장 갈 때 다시 꺼내봄 → 재방문.
 */

export interface HackStep {
  /** 단계 번호 또는 라벨 */
  label: string;
  /** 핵심 행동 */
  action: string;
  /** 부연 설명 */
  detail: string;
}

export interface HackPost {
  id: string;
  topic: string;          // 표지 헤드라인
  hookSubtitle: string;   // 시리즈 라벨
  hookBody: string;       // 표지 body — 페인+숫자 약속
  problem: { title: string; rows: { label: string; value: string }[] }; // 문제 정의
  steps: HackStep[];      // 5단계 해결법
  example: { title: string; rows: { label: string; value: string }[] }; // 실전 예시
  saveHook: string;       // 저장 유도 카피
  photoQuery: string;
}

export const HACK_POSTS: HackPost[] = [
  {
    id: "1",
    topic: "유통기한\n임박 살리는 법",
    hookSubtitle: "자취 꿀팁 #01",
    hookBody:
      "냉장고에서 죽어가는 양배추·버섯·두부.\n5분 안에 살리는 법.",
    problem: {
      title: "흔한 임박 식재료",
      rows: [
        { label: "양배추", value: "잘라뒀던 거 시들기 직전" },
        { label: "두부", value: "유통기한 1-2일 남음" },
        { label: "버섯", value: "갈변 시작" },
        { label: "우유", value: "기한 임박, 양 좀 남음" },
        { label: "채소 자투리", value: "당근·양파 끝부분" },
      ],
    },
    steps: [
      { label: "1", action: "양배추 → 채썰어 볶음밥", detail: "기름에 빠르게 볶으면 단맛 ↑, 잔반 비빔밥에도 추가" },
      { label: "2", action: "두부 → 으깨서 오믈렛", detail: "달걀 2개 + 두부 으깬 거 + 소금 = 단백질 +10g" },
      { label: "3", action: "버섯 → 들기름 볶음", detail: "들기름 + 마늘에 볶으면 갈변도 가려짐, 반찬 OK" },
      { label: "4", action: "우유 → 단호박 스프", detail: "단호박 + 우유 = 5분 컷 든든한 한 끼" },
      { label: "5", action: "채소 자투리 → 카레", detail: "당근·양파·감자 끝부분 다 넣고 카레 = 4인분" },
    ],
    example: {
      title: "이번 주 살린 식재료 = 약 8천원",
      rows: [
        { label: "양배추 1/4개", value: "약 1,500원" },
        { label: "두부 1/3모", value: "약 1,000원" },
        { label: "버섯 한 줌", value: "약 2,000원" },
        { label: "우유 200ml", value: "약 1,500원" },
        { label: "채소 자투리", value: "약 2,000원" },
      ],
    },
    saveHook: "다음 냉장고 정리 때 꺼내보세요.",
    photoQuery: "fridge organization vegetables",
  },
  {
    id: "2",
    topic: "편의점 vs\n집밥 영양",
    hookSubtitle: "자취 꿀팁 #02",
    hookBody:
      "편의점 도시락 = 나트륨 75% / 단백질 부족.\n집밥 한 끼와 비교.",
    problem: {
      title: "편의점 한 끼 (도시락+삼각김밥+컵라면)",
      rows: [
        { label: "칼로리", value: "약 1,200 kcal (한끼 과다)" },
        { label: "나트륨", value: "약 3,500mg (일일 권장 175%)" },
        { label: "단백질", value: "약 22g (보통)" },
        { label: "지방", value: "약 45g (과다)" },
        { label: "비용", value: "약 9,000원" },
      ],
    },
    steps: [
      { label: "1", action: "단백질 부족 인지", detail: "편의점은 탄수·지방 위주. 단백질 비중 낮음" },
      { label: "2", action: "나트륨 폭탄 회피", detail: "도시락+컵라면 조합은 나트륨 일일 권장 1.5배" },
      { label: "3", action: "집밥으로 대체", detail: "5천원 한 끼 = 더 영양·더 저렴" },
      { label: "4", action: "주 1회만 자취 챌린지", detail: "월 -7만원 절약 + 영양 +30%" },
      { label: "5", action: "도시락 싸기", detail: "출근/등교 자취 도시락 = 월 +12만원 절약" },
    ],
    example: {
      title: "집밥 (계란후라이덮밥)",
      rows: [
        { label: "칼로리", value: "약 420 kcal (적정)" },
        { label: "나트륨", value: "약 800mg (정상)" },
        { label: "단백질", value: "약 18g (충분)" },
        { label: "비용", value: "약 1,500원" },
        { label: "차이", value: "비용 -7,500원 / 영양 ↑↑" },
      ],
    },
    saveHook: "편의점 갈 때 다시 꺼내보세요.",
    photoQuery: "convenience store vs home cooked",
  },
  {
    id: "3",
    topic: "냉장고 파먹기\n5단계",
    hookSubtitle: "자취 꿀팁 #03",
    hookBody:
      "냉장고 텅 빈 줄 알았는데 5끼 더 가능.\n공식만 알면 끝.",
    problem: {
      title: "냉장고 파먹기 5대 난관",
      rows: [
        { label: "1", value: "재료 자투리만 남음" },
        { label: "2", value: "메뉴 떠오르지 않음" },
        { label: "3", value: "조합 어색함" },
        { label: "4", value: "맛 없을까봐 불안" },
        { label: "5", value: "결국 라면" },
      ],
    },
    steps: [
      { label: "1", action: "재료 분류", detail: "탄수(밥·면) / 단백(달걀·두부·고기) / 채소·양념" },
      { label: "2", action: "공식 적용", detail: "탄수 1 + 단백 1 + 채소 1 = 한 끼 완성" },
      { label: "3", action: "양념 결정", detail: "한식(간장·고추장) / 양식(올리브오일·치즈) 중 하나" },
      { label: "4", action: "조리법 선택", detail: "볶음(빠름) / 끓임(국·찌개) / 굽기(토스트류)" },
      { label: "5", action: "마무리 토핑", detail: "달걀 1개 / 김 / 통깨 — 비주얼 + 영양" },
    ],
    example: {
      title: "오늘 냉장고: 밥·계란·김치·양파·식빵",
      rows: [
        { label: "옵션 1", value: "김치볶음밥 + 계란프라이" },
        { label: "옵션 2", value: "에그토스트 (식빵+계란+김치)" },
        { label: "옵션 3", value: "라볶이 (라면 추가하면)" },
        { label: "옵션 4", value: "비빔밥 (반찬 있으면)" },
      ],
    },
    saveHook: "냉장고 텅 비었을 때 꺼내보세요.",
    photoQuery: "empty fridge cooking creative",
  },
  {
    id: "4",
    topic: "장보기 30분\n단축법",
    hookSubtitle: "자취 꿀팁 #04",
    hookBody:
      "마트 1시간 → 30분으로.\n동선·메뉴·예산 미리 짜기.",
    problem: {
      title: "장보기 시간 낭비 원인",
      rows: [
        { label: "1", value: "메뉴 미리 안 정함" },
        { label: "2", value: "마트 동선 모름" },
        { label: "3", value: "예산 안 정해서 우왕좌왕" },
        { label: "4", value: "특가 보고 충동 구매" },
        { label: "5", value: "결국 다 못 쓰고 버림" },
      ],
    },
    steps: [
      { label: "1", action: "1주 식단 미리", detail: "30분 투자 = 7끼 결정 (월·화·수·목·금)" },
      { label: "2", action: "재료 리스트", detail: "메뉴별 재료 → 합계 → 중복 제거" },
      { label: "3", action: "예산 설정", detail: "1주 3-5만원, 한 끼 5천원 기준" },
      { label: "4", action: "마트 동선", detail: "신선식품 → 냉동 → 가공 → 음료 (역순도 OK)" },
      { label: "5", action: "특가 무시", detail: "안 사기로 한 거 절대 X — 식비 통제 핵심" },
    ],
    example: {
      title: "이번 주 장보기 (28분)",
      rows: [
        { label: "준비", value: "메뉴 결정 5분 + 리스트 3분" },
        { label: "이동", value: "마트 왕복 10분" },
        { label: "쇼핑", value: "마트 안 10분" },
        { label: "총합", value: "28분 / 4만 5천원 / 7끼분" },
      ],
    },
    saveHook: "다음 마트 갈 때 다시 꺼내보세요.",
    photoQuery: "korean grocery shopping efficient",
  },
  {
    id: "5",
    topic: "주말 2시간\n= 평일 5끼",
    hookSubtitle: "자취 꿀팁 #05",
    hookBody:
      "주말 2시간 미리 조리 = 평일 5끼 3분 컷.\n자취 5년차 핵심 루틴.",
    problem: {
      title: "평일 자취 어려움",
      rows: [
        { label: "1", value: "퇴근 후 피곤 → 자취 포기" },
        { label: "2", value: "메뉴 결정 시간 부족" },
        { label: "3", value: "조리 30분 = 야식 편의점" },
        { label: "4", value: "결국 배달비 7만원" },
      ],
    },
    steps: [
      { label: "1", action: "주말 식단 미리", detail: "월~금 5끼 메뉴 결정 (10분)" },
      { label: "2", action: "재료 손질 일괄", detail: "야채 다듬기·고기 1회분 소분 (30분)" },
      { label: "3", action: "베이스 조리", detail: "닭가슴살 삶기·계란 7개 삶기 (30분)" },
      { label: "4", action: "1회분 소분", detail: "지퍼백 7개 → 매끼 꺼내기만 (15분)" },
      { label: "5", action: "조리법 메모", detail: "각 봉지에 'X분 데우기' 메모 (5분)" },
    ],
    example: {
      title: "주말 2시간 → 평일 한 끼당 3분",
      rows: [
        { label: "준비", value: "토요일 오전 2시간" },
        { label: "월요일 저녁", value: "데우기 3분 → 한 끼 완성" },
        { label: "화-금", value: "동일 — 매일 3분 컷" },
        { label: "절약", value: "주 5회 자취 = 월 -10만원" },
      ],
    },
    saveHook: "주말 자취 시작 전 다시 꺼내보세요.",
    photoQuery: "meal prep weekend cooking",
  },
  {
    id: "6",
    topic: "라면을\n영양식으로",
    hookSubtitle: "자취 꿀팁 #06",
    hookBody:
      "라면 한 봉 + 5가지 토핑 = 진짜 한 끼.\n영양 균형 + 만족감.",
    problem: {
      title: "라면 1봉 한계",
      rows: [
        { label: "단백질", value: "약 10g (부족)" },
        { label: "식이섬유", value: "거의 0" },
        { label: "비타민", value: "거의 0" },
        { label: "나트륨", value: "1,800mg (과다)" },
      ],
    },
    steps: [
      { label: "1", action: "스프 절반만", detail: "나트륨 -50% — 맛 큰 차이 X" },
      { label: "2", action: "계란 1개", detail: "단백질 +6g / 칼로리 +70" },
      { label: "3", action: "콩나물 한 줌", detail: "섬유 + 해독 + 시원한 맛" },
      { label: "4", action: "두부 1/3모", detail: "단백질 +7g / 포만감 ↑" },
      { label: "5", action: "치즈 1장", detail: "칼슘 + 풍미 (옵션)" },
    ],
    example: {
      title: "토핑 5가지 추가 한 끼",
      rows: [
        { label: "추가 비용", value: "약 1,500원" },
        { label: "단백질", value: "10g → 23g (2배)" },
        { label: "나트륨", value: "1,800mg → 900mg" },
        { label: "포만감", value: "1.5배 ↑" },
      ],
    },
    saveHook: "라면 끓일 때마다 다시 꺼내보세요.",
    photoQuery: "ramen with toppings korean",
  },
  {
    id: "7",
    topic: "자취 부엌\n도구 5개",
    hookSubtitle: "자취 꿀팁 #07",
    hookBody:
      "자취 5년차가 진짜 쓰는 부엌 도구 5개.\n나머지는 다 사치.",
    problem: {
      title: "자취 부엌 흔한 함정",
      rows: [
        { label: "1", value: "도구 너무 많이 삼" },
        { label: "2", value: "한 번 쓰고 안 씀" },
        { label: "3", value: "공간만 차지" },
        { label: "4", value: "정작 필요한 거 없음" },
      ],
    },
    steps: [
      { label: "1", action: "26cm 팬 1개", detail: "볶음·구이·볶음밥 다 됨. 28cm는 좁은 부엌엔 부담" },
      { label: "2", action: "냄비 1.5L 1개", detail: "라면·국·찌개 다 됨. 1인분에 딱" },
      { label: "3", action: "도마 + 식칼", detail: "도마 大 1개. 식칼은 무난한 셰프나이프 1자루" },
      { label: "4", action: "전자레인지 용기", detail: "1L 짜리 1개. 데우기·찜·전자레인지 요리 다 됨" },
      { label: "5", action: "지퍼백 + 위생장갑", detail: "재료 소분 + 손질용. 박스로 사두면 1년 가용" },
    ],
    example: {
      title: "초기 투자 약 5만원",
      rows: [
        { label: "팬 + 냄비", value: "약 3만원" },
        { label: "도마 + 칼", value: "약 1만원" },
        { label: "전자레인지 용기", value: "약 5천원" },
        { label: "지퍼백·장갑", value: "약 5천원" },
      ],
    },
    saveHook: "자취 시작 전·이사 직후 다시 꺼내보세요.",
    photoQuery: "minimalist kitchen tools small",
  },
  {
    id: "8",
    topic: "식비 통제\n6단계",
    hookSubtitle: "자취 꿀팁 #08",
    hookBody:
      "월 식비 60 → 30만원, 1년 360만원 절약.\n6단계 시스템.",
    problem: {
      title: "식비 폭발 원인",
      rows: [
        { label: "1", value: "외식·배달 의존" },
        { label: "2", value: "장본 거 다 못 씀" },
        { label: "3", value: "충동 구매" },
        { label: "4", value: "기록 안 함 (가시화 X)" },
        { label: "5", value: "예산 없음" },
      ],
    },
    steps: [
      { label: "1", action: "주 1회 장보기", detail: "5만원 한도. 매일 가지 말 것" },
      { label: "2", action: "1주 식단 미리", detail: "장보기 전 메뉴 정해두면 낭비 -50%" },
      { label: "3", action: "도시락 챌린지", detail: "주 2회 도시락 = 월 -8만원" },
      { label: "4", action: "배달비 인지", detail: "배달비 4천원 = 자취 한 끼 비용" },
      { label: "5", action: "기록", detail: "가계부 앱 — 월 1회 점검 필수" },
      { label: "6", action: "예산 정함", detail: "월 식비 30만원 한도, 초과 시 다음 주 줄임" },
    ],
    example: {
      title: "6개월 후",
      rows: [
        { label: "1개월차", value: "월 60 → 50만원 (-10만)" },
        { label: "3개월차", value: "월 50 → 35만원 (-15만)" },
        { label: "6개월차", value: "월 30만원 안정 (-30만)" },
        { label: "1년 절약", value: "약 360만원" },
      ],
    },
    saveHook: "월말 카드 명세 충격받았을 때 꺼내보세요.",
    photoQuery: "korean budget tracking finance",
  },
];

export function findHackPost(id: string): HackPost | undefined {
  return HACK_POSTS.find((p) => p.id === id);
}
