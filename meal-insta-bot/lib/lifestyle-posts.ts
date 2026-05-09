/**
 * 페르소나 / 공감 콘텐츠 — 공유 유도형.
 * "너는 어떤 자취러야?" 같은 정체성·MBTI·진단 톤.
 * 알고리즘 친화: 댓글·DM 공유 트리거.
 */

export interface LifestyleType {
  /** 유형 이름 (예: "배민 VVIP형") */
  name: string;
  /** 유형 한 줄 묘사 */
  trait: string;
  /** 식단 특징 */
  habit: string;
  /** 소요 앱 처방 */
  prescription: string;
}

export interface LifestylePost {
  id: string;
  topic: string;          // 표지 헤드라인 (강한 후크)
  hookSubtitle: string;   // 시리즈 라벨
  hookBody: string;       // 표지 body — 공감+약속
  intro: { title: string; rows: { label: string; value: string }[] };
  types: LifestyleType[]; // 유형 4-5개 (한 카드당 1-2개)
  conclusion: string;     // 한 줄 정리
  shareHook: string;      // "친구 태그" 명시 후크
  photoQuery: string;
}

export const LIFESTYLE_POSTS: LifestylePost[] = [
  {
    id: "1",
    topic: "자취생\n5가지 유형",
    hookSubtitle: "자취 라이프 진단 #01",
    hookBody:
      "당신은 어떤 자취러?\n친구 태그하면서 같이 맞춰보세요.",
    intro: {
      title: "5가지 유형",
      rows: [
        { label: "1", value: "배민 VVIP형" },
        { label: "2", value: "냉장고 파먹기 고수형" },
        { label: "3", value: "밀키트 의존형" },
        { label: "4", value: "라면 한식형" },
        { label: "5", value: "자취 5년차 정복형" },
      ],
    },
    types: [
      {
        name: "배민 VVIP형",
        trait: "월 배달비만 8만원",
        habit: "냉장고는 음료수만, 모든 끼니가 배달",
        prescription: "주 1회 자취 시작 — 5천원 한 끼 레시피로",
      },
      {
        name: "냉장고 파먹기 고수형",
        trait: "있는 재료로 다 만들 수 있음",
        habit: "장보기 안 하고 1주 버틸 수 있는 능력자",
        prescription: "잔반 비빔밥·볶음밥 변형 레시피 추천",
      },
      {
        name: "밀키트 의존형",
        trait: "쿠팡 새벽배송 단골",
        habit: "재료는 다 사놨는데 손질이 귀찮음",
        prescription: "재료 손질 안 하는 5분 컷 레시피로 입문",
      },
      {
        name: "라면 한식형",
        trait: "일주일에 라면 4번",
        habit: "라면 + 김치 + 계란이 자취 3대장",
        prescription: "라면 영양 보강법 + 비슷한 만족감 한식",
      },
      {
        name: "자취 5년차 정복형",
        trait: "메뉴 고민이 가장 큰 어려움",
        habit: "다 만들 줄 아는데 매일 뭐 먹을지 모름",
        prescription: "주간 식단표 + 영양 균형 자동 추천",
      },
    ],
    conclusion: "어떤 유형이든 OK.\n중요한 건 다음 한 끼.",
    shareHook: "댓글에 본인 유형 + 친구 태그.",
    photoQuery: "korean lifestyle young person eating",
  },
  {
    id: "2",
    topic: "혼밥\n레벨 진단",
    hookSubtitle: "자취 라이프 진단 #02",
    hookBody:
      "1단계 라면충 → 5단계 한식 마스터.\n당신의 혼밥 레벨은?",
    intro: {
      title: "5단계",
      rows: [
        { label: "Lv.1", value: "라면·즉석밥 (생존)" },
        { label: "Lv.2", value: "냉동 만두·볶음밥 (편의)" },
        { label: "Lv.3", value: "간단 한 끼 자취 (입문)" },
        { label: "Lv.4", value: "주간 식단 + 장보기 (운영)" },
        { label: "Lv.5", value: "남에게 해줄 수 있음 (정복)" },
      ],
    },
    types: [
      {
        name: "Lv.1 — 라면충",
        trait: "냉장고에 김치·계란만 있음",
        habit: "주 5회 라면 + 1회 배달 + 1회 외식",
        prescription: "10분 한 끼 레시피로 Lv.2 도전",
      },
      {
        name: "Lv.2 — 냉동 의존자",
        trait: "냉동실이 메인 식료품 저장소",
        habit: "냉동 만두·즉석밥 마스터",
        prescription: "냉동 + 신선식품 1가지 추가하면 Lv.3",
      },
      {
        name: "Lv.3 — 자취 입문자",
        trait: "한 끼 자취 가능, 메뉴 고정",
        habit: "할 줄 아는 메뉴 5개 로테이션",
        prescription: "주간 식단표로 메뉴 다양화 → Lv.4",
      },
      {
        name: "Lv.4 — 자취 운영자",
        trait: "장보기·식단·예산 다 관리",
        habit: "월 식비 30만원 컨트롤",
        prescription: "영양 분석 추가하면 Lv.5",
      },
      {
        name: "Lv.5 — 자취 마스터",
        trait: "친구 초대해서 해먹임",
        habit: "냉장고 보고 메뉴 즉흥 결정 가능",
        prescription: "이 단계면 본인이 콘텐츠 만들기 시작",
      },
    ],
    conclusion: "레벨 올리는 비법 = 다음 한 끼만 자취.",
    shareHook: "댓글에 본인 레벨 + 친구 태그해서 진단.",
    photoQuery: "cooking levels progression",
  },
  {
    id: "3",
    topic: "식비\n점수 테스트",
    hookSubtitle: "자취 라이프 진단 #03",
    hookBody:
      "월 식비 적정선 = 25-35만원.\n당신은 몇 점?",
    intro: {
      title: "월 식비 구간",
      rows: [
        { label: "60만원↑", value: "외식·배달 의존 (20점)" },
        { label: "40-60만원", value: "혼합형 (50점)" },
        { label: "25-40만원", value: "자취 위주 (80점)" },
        { label: "20만원 이하", value: "초절약 (100점)" },
      ],
    },
    types: [
      {
        name: "20점 — 외식 의존",
        trait: "주 5회 이상 외식·배달",
        habit: "장보기 안 함, 냉장고 비어있음",
        prescription: "주 2회 자취부터 시작 — 한 달 -10만원",
      },
      {
        name: "50점 — 혼합형",
        trait: "외식 3-4회, 자취 2-3회",
        habit: "재료 사놨다가 못 쓰고 버리기 잦음",
        prescription: "1주 식단표로 장보기 정확히 → -8만원",
      },
      {
        name: "80점 — 자취 위주",
        trait: "주 5회 이상 자취",
        habit: "장보기 주 1회 정확히 운영",
        prescription: "영양 균형 + 다양성 추가",
      },
      {
        name: "100점 — 초절약",
        trait: "월 20만원 이하",
        habit: "쌀·계란·김치 위주",
        prescription: "단백질·채소 보충 — 영양 결핍 주의",
      },
    ],
    conclusion: "식비 적정선은 25-35만원.\n너무 적으면 영양 위험.",
    shareHook: "댓글로 본인 점수 + 친구한테 인증 태그.",
    photoQuery: "korean budget grocery shopping",
  },
  {
    id: "4",
    topic: "냉파 vs\n배달형",
    hookSubtitle: "자취 라이프 진단 #04",
    hookBody:
      "냉장고 파먹기 고수 vs 배달 매니아.\n어느 쪽이 인생에 이득?",
    intro: {
      title: "한 달 비교",
      rows: [
        { label: "냉파형", value: "월 식비 18만원 / 시간 +5h" },
        { label: "배달형", value: "월 식비 65만원 / 시간 절약 5h" },
        { label: "차이", value: "47만원 / 1년 564만원" },
      ],
    },
    types: [
      {
        name: "냉파형",
        trait: "냉장고에 있는 거로 다 만들 수 있음",
        habit: "잔반·자투리 활용 마스터, 음식물 쓰레기 거의 0",
        prescription: "유지하면서 영양 균형만 체크 (단백질·채소)",
      },
      {
        name: "혼합형",
        trait: "주 2-3회 자취 + 나머지 배달",
        habit: "장보기는 하지만 다 못 쓰고 버림",
        prescription: "장보기 시 1주 식단 미리 — 낭비 -50%",
      },
      {
        name: "배달형",
        trait: "냉장고 = 음료 저장소",
        habit: "배민 VVIP, 단골 가게 5곳",
        prescription: "주 1회만 자취해도 월 -8만원 절약 시작",
      },
    ],
    conclusion: "냉파형 = 1년 564만원 더 모으기.\n배달형은 시간 부자지만 통장은 가난.",
    shareHook: "당신은 어느 쪽? 댓글 + 친구 태그로 인증.",
    photoQuery: "fridge vs delivery comparison",
  },
  {
    id: "5",
    topic: "자취 N년차\n식습관 변화",
    hookSubtitle: "자취 라이프 진단 #05",
    hookBody:
      "1년차 라면 → 5년차 한식.\n자취 연차별 식습관 진화.",
    intro: {
      title: "연차별 변화",
      rows: [
        { label: "1년차", value: "라면·즉석밥·배달" },
        { label: "2년차", value: "냉동 만두·볶음밥" },
        { label: "3년차", value: "한 끼 자취 입문" },
        { label: "5년차", value: "주간 식단·영양 관리" },
        { label: "10년차", value: "냉장고만 봐도 메뉴 결정" },
      ],
    },
    types: [
      {
        name: "1년차 — 생존 모드",
        trait: "엄마 집밥이 그리움",
        habit: "라면·배달이 주식, 김치는 본가에서 받음",
        prescription: "10분 한 끼 레시피 5개만 익히기",
      },
      {
        name: "2-3년차 — 적응기",
        trait: "메뉴 고민이 가장 큰 스트레스",
        habit: "할 줄 아는 메뉴 3-5개 무한 반복",
        prescription: "주간 식단표로 메뉴 다양화 시작",
      },
      {
        name: "5년차 — 운영기",
        trait: "장보기·식단·예산 마스터",
        habit: "월 식비 30만원 컨트롤, 외식은 사회생활용",
        prescription: "영양 균형 + 효율 (반복가능 루틴) 강화",
      },
      {
        name: "10년차 — 정복기",
        trait: "냉장고 보고 즉흥 메뉴 결정",
        habit: "친구 초대해서 해주기 가능",
        prescription: "이 단계면 본인이 자취 콘텐츠 제작",
      },
    ],
    conclusion: "연차 무관 — 다음 한 끼 자취가 시작.",
    shareHook: "본인 연차 + 친구 태그로 같이 인증.",
    photoQuery: "cooking journey years progression",
  },
  {
    id: "6",
    topic: "MBTI별\n자취 식단",
    hookSubtitle: "자취 라이프 진단 #06",
    hookBody:
      "I는 냉파형, E는 외식형?\nMBTI별 자취 패턴.",
    intro: {
      title: "성향별",
      rows: [
        { label: "I (내향)", value: "혼밥 OK, 자취 친화" },
        { label: "E (외향)", value: "친구랑 외식 선호" },
        { label: "S (감각)", value: "레시피 정확히 따라함" },
        { label: "N (직관)", value: "재료 보고 즉흥 요리" },
        { label: "J (계획)", value: "주간 식단표 작성" },
        { label: "P (인식)", value: "그날 끌리는 거" },
      ],
    },
    types: [
      {
        name: "INTJ — 효율 마스터",
        trait: "주간 식단·예산·영양 다 계산",
        habit: "엑셀로 식비 관리, 동선 최적화",
        prescription: "이미 잘함. 영양 균형만 추가 체크",
      },
      {
        name: "ENFP — 즉흥 자취러",
        trait: "오늘 끌리는 거 만듦",
        habit: "냉장고 보고 즉흥 결정, 새 레시피 도전",
        prescription: "기본 식재료 비축 → 즉흥 자유도 ↑",
      },
      {
        name: "ISFP — 정성형",
        trait: "한 끼라도 예쁘게 차림",
        habit: "플레이팅·식기까지 신경 씀",
        prescription: "레시피보다 재료 퀄리티 투자",
      },
      {
        name: "ESTJ — 루틴 마스터",
        trait: "월·화·수 메뉴 고정",
        habit: "장보기 주 1회 동일 시간",
        prescription: "주간 식단표로 효율 ↑↑",
      },
    ],
    conclusion: "MBTI 무관 — 자기 패턴 찾기가 핵심.",
    shareHook: "본인 MBTI + 자취 패턴 댓글로.",
    photoQuery: "personality types food lifestyle",
  },
  {
    id: "7",
    topic: "자취 흑역사\n5선",
    hookSubtitle: "자취 라이프 공감 #07",
    hookBody:
      "다들 한 번씩 겪는 자취 흑역사.\n공감되면 친구 태그.",
    intro: {
      title: "흑역사 5선",
      rows: [
        { label: "1", value: "라면 + 김치 일주일" },
        { label: "2", value: "유통기한 지난 우유 발견" },
        { label: "3", value: "장 본 재료 다 못 쓰고 버림" },
        { label: "4", value: "배달 한 달 80만원 결제" },
        { label: "5", value: "감기로 굶다가 라면 끓일 힘도 없음" },
      ],
    },
    types: [
      {
        name: "1. 라면 + 김치 일주일",
        trait: "월급 직전, 통장 잔고 5만원",
        habit: "냉장고 텅 비고 라면만 5봉",
        prescription: "비상식: 즉석밥 + 참치캔 + 김 — 5천원으로 5일",
      },
      {
        name: "2. 유통기한 지난 우유",
        trait: "냉장고 안 열어본 지 일주일",
        habit: "사놓고 잊어버림 → 다음에 발견",
        prescription: "1주 1번 냉장고 점검 + 식단 미리 짜기",
      },
      {
        name: "3. 장본 재료 다 못 쓰고 버림",
        trait: "양상추·파 등 시들어서 폐기",
        habit: "사야지 → 못 쓰고 버림 → 죄책감",
        prescription: "1주 식단 미리 정하고 그 재료만 사기",
      },
      {
        name: "4. 배달 80만원 결제",
        trait: "월말에 카드 명세 보고 충격",
        habit: "퇴근 후 피곤 → 자동 배달 클릭",
        prescription: "주 2회 자취 챌린지부터 시작",
      },
      {
        name: "5. 감기로 굶음",
        trait: "라면 끓일 힘도 없는 자취 위기",
        habit: "약·죽·이온 음료 미비축",
        prescription: "비상 비축: 즉석죽 3개·이온 음료 4개·약",
      },
    ],
    conclusion: "흑역사도 자취 5년차 통과의례.\n다음 끼니부터 다시.",
    shareHook: "본인 흑역사 + 친구 태그하며 위로.",
    photoQuery: "messy single life food",
  },
  {
    id: "8",
    topic: "혼자 사는 사람\n식단 5가지 진실",
    hookSubtitle: "자취 라이프 공감 #08",
    hookBody:
      "혼자 살면 식단이 어떻게 변하는지.\n공감되면 저장.",
    intro: {
      title: "5가지 진실",
      rows: [
        { label: "1", value: "메뉴 결정이 가장 큰 스트레스" },
        { label: "2", value: "혼자라서 영양 더 신경 써야 함" },
        { label: "3", value: "외식이 사회생활 핵심" },
        { label: "4", value: "냉장고 = 자취 인격" },
        { label: "5", value: "잘 먹어야 자취 지속 가능" },
      ],
    },
    types: [
      {
        name: "1. 메뉴 결정 스트레스",
        trait: "자취 N년차 가장 큰 어려움",
        habit: "매끼 5분 고민 × 365일 × 3끼 = 27시간/년",
        prescription: "주간 식단표로 30분에 일주일 결정",
      },
      {
        name: "2. 혼자라서 영양 더 챙겨야",
        trait: "엄마가 챙겨주던 균형 직접 관리",
        habit: "단백질·채소 부족 흔함",
        prescription: "매끼 손바닥 단백질 + 한 줌 채소 룰",
      },
      {
        name: "3. 외식 = 사회생활",
        trait: "친구 만나면 외식 = 약속",
        habit: "주 2-3회는 어차피 외식",
        prescription: "외식 빼고 평일 자취 5회로 균형",
      },
      {
        name: "4. 냉장고 = 자취 인격",
        trait: "냉장고 보면 그 사람 자취 수준 보임",
        habit: "정리 vs 카오스, 신선식품 vs 즉석식",
        prescription: "주 1회 냉장고 정리 → 식단 안정",
      },
      {
        name: "5. 잘 먹어야 자취 지속",
        trait: "건강 무너지면 자취 끝",
        habit: "라면만 먹으면 3개월 후 빈혈·피로",
        prescription: "한 끼라도 진짜 한 끼 — 매일 1번",
      },
    ],
    conclusion: "혼자라도 잘 먹기 = 자취 성공 핵심.",
    shareHook: "공감되면 저장 + 친구 태그.",
    photoQuery: "single life eating alone",
  },
];

export function findLifestylePost(id: string): LifestylePost | undefined {
  return LIFESTYLE_POSTS.find((p) => p.id === id);
}
