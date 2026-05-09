/**
 * 소요 앱 RECIPES 데이터를 카드뉴스에서 그대로 사용.
 * 원본: C:/Users/chosh/Desktop/soyo/constants/RecipeData.ts
 *
 * 운영 시: 소요 백엔드/Supabase API에서 fetch하도록 교체 예정.
 *          현재는 정적 복제로 단일 소스 흉내.
 */

export interface Recipe {
  id: string;
  name: string;
  time: number; // minutes
  ingredients: string[];
  steps: string[];
  kcal: number;
  category: "한식" | "양식" | "일식" | "간식" | "샐러드";
  tag: string;
  tagColor: string;
  tagBg: string;
  iconName: string;
  iconColor: string;
  thumbBg: string;
  difficulty: "초간단" | "쉬움" | "보통";
  tip?: string;
  /**
   * 카드뉴스 커버 사진 URL.
   * 운영 시: Unsplash API + image_concept으로 자동 검색.
   * 현재: 음식별 고정 URL (Unsplash CDN).
   */
  photoUrl?: string;
}

/**
 * 음식 이름 → 사진 URL.
 *
 * 한식: Wikimedia Commons 우선 (한식 이름이 정확히 인덱싱됨, 안정 URL)
 * 양식·간식·샐러드: Unsplash CDN
 *
 * Wikimedia 썸네일 URL 패턴:
 *   https://upload.wikimedia.org/wikipedia/commons/thumb/<x>/<xx>/<File>.jpg/<W>px-<File>.jpg
 * Unsplash CDN 패턴:
 *   https://images.unsplash.com/photo-<id>?w=1080&h=1350&fit=crop
 */
const UNSPLASH_OPT = "?w=1080&h=1350&fit=crop";

/**
 * Wikimedia 원본 URL.
 * 썸네일(1080px-...)은 일부 사이즈만 미리 생성되어 있어 400 빈번.
 * 원본은 항상 200으로 응답 → 브라우저 object-cover로 리사이즈.
 * 트레이드오프: 파일 1~3MB. 카드뉴스 10개라면 부담 없음.
 */
function wikimedia(file: string, hashDir: string): string {
  const enc = file.replace(/ /g, "_");
  return `https://upload.wikimedia.org/wikipedia/commons/${hashDir}/${enc}`;
}

export const FOOD_PHOTOS: Record<string, string> = {
  // ── 한식 (Wikimedia 검증) ───────────────────────────────
  김치볶음밥: wikimedia("Korean_cuisine-Kimchi_bokkeumbap-01.jpg", "0/0d"),
  김치찌개: wikimedia("Korean_stew-Kimchi_jjigae-02.jpg", "9/9b"),
  냉동밥볶음밥: wikimedia("Bokkeumbap.jpg", "f/f6"),
  미역국한끼: "https://upload.wikimedia.org/wikipedia/commons/3/36/Miyeok-guk.jpg",
  된장찌개: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Doenjang-jjigae.jpg",
  라볶이: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Tteokbokki.JPG", // 떡 + 양념 가까움
  잔반비빔밥: "https://upload.wikimedia.org/wikipedia/commons/4/44/Dolsot-bibimbap.jpg",
  간단잡채: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Polish_Korean_Cuisine_and_Culture_Exchanges_Gradmother%E2%80%99s_Recipes_05.jpg",
  카레라이스: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Beef_curry_rice_003.jpg",
  짜장밥: "https://upload.wikimedia.org/wikipedia/commons/7/78/Jajangmyeon.jpg",
  간단부대찌개: "https://upload.wikimedia.org/wikipedia/commons/8/82/Budae_jjigae_%2828587380901%29.jpg",
  간단닭볶음탕: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Korean.food-Dakbokemtang-01.jpg",
  만두국: "https://upload.wikimedia.org/wikipedia/commons/0/0c/%EB%A7%8C%EB%91%90.jpg",
  전자레인지달걀찜: "https://upload.wikimedia.org/wikipedia/commons/2/20/Gyeranjjim.jpg",

  // ── 양식 (Wikimedia 검증) ───────────────────────────────
  알리오올리오: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Aglio_e_olio.jpg",
  "1인까르보나라": "https://upload.wikimedia.org/wikipedia/commons/3/33/Espaguetis_carbonara.jpg",
  그릴드치즈: "https://upload.wikimedia.org/wikipedia/commons/1/13/Classic_Grilled_Cheese_Sandwich_%2825791331763%29_%28cropped%29.jpg",
  토르티야부리또: "https://upload.wikimedia.org/wikipedia/commons/6/60/Burrito.JPG",

  // ── 간식 (Wikimedia 검증) ───────────────────────────────
  떡볶이: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Tteokbokki.JPG",
  어묵탕: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Fish_cakes_food_dinner.jpg",
  즉석김밥: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Gimbap_%28pixabay%29.jpg",
  냉동만두굽기: "https://upload.wikimedia.org/wikipedia/commons/0/0c/%EB%A7%8C%EB%91%90.jpg",

  // ── 일식 (Wikimedia 검증) ───────────────────────────────
  오야코동: "https://upload.wikimedia.org/wikipedia/commons/2/29/Oyakodon_003.jpg",
  간단가츠동: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Katsudon_001.jpg",
  간단우동: "https://upload.wikimedia.org/wikipedia/commons/9/97/Kakeudon.jpg",
  야키소바: "https://upload.wikimedia.org/wikipedia/commons/4/42/Nagata_Honjoken_Bokkake_Yakisoba.jpg",
  일본식카레: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Beef_curry_rice_003.jpg",
  간단미소국: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Miso_Soup_001.jpg",

  // ── 양식·간식·샐러드 (Unsplash, 시각 확인) ────────────
  계란후라이덮밥:
    "https://images.unsplash.com/photo-1761064776495-357b1f05dcca" + UNSPLASH_OPT,
  참치마요파스타:
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141" + UNSPLASH_OPT,
  두부샐러드:
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd" + UNSPLASH_OPT,
  아보카도토스트:
    "https://images.unsplash.com/photo-1525351484163-7529414344d8" + UNSPLASH_OPT,
  그릭요거트과일볼:
    "https://images.unsplash.com/photo-1488477181946-6428a0291777" + UNSPLASH_OPT,
};

/**
 * 카테고리별 사진 풀 — FOOD_PHOTOS 매핑 없는 음식의 fallback.
 * recipe.id 기반 결정적 분배 → 같은 음식은 항상 같은 사진,
 * 다른 음식은 풀 안에서 다른 사진을 받음.
 *
 * 모든 ID는 Unsplash food 카테고리 기반.
 * 정확도 100% 보장 X — 잘못된 매칭 발견 시 lib/recipe-source.ts FOOD_PHOTOS에 직접 추가.
 */
const CATEGORY_POOLS: Record<Recipe["category"], string[]> = {
  한식: [
    "https://images.unsplash.com/photo-1583224964978-2257b960c3d3" + UNSPLASH_OPT,
    "https://images.unsplash.com/photo-1580651315530-69c8e0903883" + UNSPLASH_OPT,
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa" + UNSPLASH_OPT,
    "https://images.unsplash.com/photo-1582450871972-ab5ca641643d" + UNSPLASH_OPT,
    "https://images.unsplash.com/photo-1632789395770-20e6f63be806" + UNSPLASH_OPT,
  ],
  양식: [
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141" + UNSPLASH_OPT,
    "https://images.unsplash.com/photo-1473093226795-af9932fe5856" + UNSPLASH_OPT,
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38" + UNSPLASH_OPT,
    "https://images.unsplash.com/photo-1525351484163-7529414344d8" + UNSPLASH_OPT,
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c" + UNSPLASH_OPT,
  ],
  샐러드: [
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd" + UNSPLASH_OPT,
    "https://images.unsplash.com/photo-1540420773420-3366772f4999" + UNSPLASH_OPT,
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061" + UNSPLASH_OPT,
    "https://images.unsplash.com/photo-1488477181946-6428a0291777" + UNSPLASH_OPT,
    "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af" + UNSPLASH_OPT,
  ],
  간식: [
    "https://images.unsplash.com/photo-1626700051175-6818013e1d4f" + UNSPLASH_OPT,
    "https://images.unsplash.com/photo-1559717865-a99cac1c95d8" + UNSPLASH_OPT,
    "https://images.unsplash.com/photo-1585032226651-759b368d7246" + UNSPLASH_OPT,
    "https://images.unsplash.com/photo-1488900128323-21503983a07e" + UNSPLASH_OPT,
    "https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8" + UNSPLASH_OPT,
  ],
  일식: [
    "https://images.unsplash.com/photo-1606491956689-2ea866880c84" + UNSPLASH_OPT,
    "https://images.unsplash.com/photo-1617196333958-f8f0eb4d7e2c" + UNSPLASH_OPT,
    "https://images.unsplash.com/photo-1607330289024-1535c6b4e1c1" + UNSPLASH_OPT,
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624" + UNSPLASH_OPT,
    "https://images.unsplash.com/photo-1614436163996-25cee5f54290" + UNSPLASH_OPT,
  ],
};

const GENERIC_FOOD_PHOTO =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c" + UNSPLASH_OPT;

export function photoFor(recipe: Recipe): string {
  if (recipe.photoUrl) return recipe.photoUrl;
  // 1순위: 음식 이름 직접 매핑
  const key = recipe.name.replace(/\s+/g, "");
  if (FOOD_PHOTOS[key]) return FOOD_PHOTOS[key];
  // 2순위: 카테고리 풀에서 id 기반 결정적 선택 (같은 음식 = 항상 같은 사진)
  const pool = CATEGORY_POOLS[recipe.category];
  if (pool && pool.length > 0) {
    const idx = (parseInt(recipe.id, 10) || 0) % pool.length;
    return pool[idx];
  }
  // 3순위: 최종 fallback
  return GENERIC_FOOD_PHOTO;
}

export function photoForName(name: string): string {
  const key = name.replace(/\s+/g, "");
  return FOOD_PHOTOS[key] ?? GENERIC_FOOD_PHOTO;
}

export const RECIPES: Recipe[] = [
  {
    id: "1",
    name: "계란후라이덮밥",
    time: 10,
    difficulty: "초간단",
    category: "한식",
    kcal: 420,
    ingredients: [
      "밥 1공기",
      "달걀 2개",
      "간장 1큰술",
      "참기름 1/2작은술",
      "파 약간",
    ],
    steps: [
      "밥을 그릇에 담아둡니다.",
      "달걀프라이를 반숙으로 굽습니다.",
      "간장과 참기름을 밥 위에 두르고 달걀을 올립니다.",
      "파를 송송 썰어 위에 올리면 완성!",
    ],
    tip: "달걀은 약불에서 천천히 익혀야 반숙이 예쁘게 나와요.",
    tag: "초간단",
    tagColor: "#C8922A",
    tagBg: "#FDF4E0",
    iconName: "sun",
    iconColor: "#C8922A",
    thumbBg: "#FFF8E0",
  },
  {
    id: "2",
    name: "참치마요 파스타",
    time: 15,
    difficulty: "쉬움",
    category: "양식",
    kcal: 560,
    ingredients: [
      "파스타 면 100g",
      "참치캔 1개",
      "마요네즈 2큰술",
      "간장 1작은술",
      "후추 약간",
      "파슬리 약간",
    ],
    steps: [
      "파스타를 소금물에 8~10분 삶습니다.",
      "참치캔 기름을 제거합니다.",
      "삶은 파스타에 참치, 마요네즈, 간장을 넣고 버무립니다.",
      "후추와 파슬리를 뿌려 완성!",
    ],
    tip: "파스타 삶는 물에 소금을 넉넉히 넣어야 면에 간이 배어요.",
    tag: "오늘의 픽",
    tagColor: "#C4674A",
    tagBg: "#FAEEE9",
    iconName: "coffee",
    iconColor: "#C4674A",
    thumbBg: "#FFF0E8",
  },
  {
    id: "3",
    name: "두부 샐러드",
    time: 5,
    difficulty: "초간단",
    category: "샐러드",
    kcal: 180,
    ingredients: [
      "두부 1/2모",
      "양상추 한 줌",
      "방울토마토 5개",
      "드레싱(간장 1큰술, 식초 1큰술, 참기름 1작은술)",
    ],
    steps: [
      "두부를 먹기 좋은 크기로 자릅니다.",
      "양상추를 씻어 뜯어 놓습니다.",
      "방울토마토를 반으로 자릅니다.",
      "드레싱 재료를 섞어 위에 뿌리면 완성!",
    ],
    tip: "두부는 키친타월로 물기를 제거하면 드레싱이 잘 배어요.",
    tag: "건강식", tagColor: "#6B8C6A", tagBg: "#EDF4EC",
    iconName: "map-pin", iconColor: "#6B8C6A", thumbBg: "#EDF4EC",
  },
  {
    id: "4",
    name: "김치찌개",
    time: 20,
    difficulty: "보통",
    category: "한식",
    kcal: 380,
    ingredients: [
      "김치 200g",
      "돼지고기 100g (선택)",
      "두부 1/2모",
      "대파 1/3대",
      "고춧가루 1큰술",
      "된장 1/2큰술",
      "물 300ml",
    ],
    steps: [
      "냄비에 기름을 두르고 김치와 돼지고기를 볶습니다.",
      "물을 붓고 된장, 고춧가루를 넣어 끓입니다.",
      "두부를 넣고 10분 더 끓입니다.",
      "대파를 넣고 1분 후 완성!",
    ],
    tip: "묵은지를 쓰면 훨씬 깊은 맛이 나요.",
    tag: "인기", tagColor: "#C4674A", tagBg: "#FFECEC",
    iconName: "thermometer", iconColor: "#C4674A", thumbBg: "#FFECEC",
  },
  {
    id: "5",
    name: "전자레인지 달걀찜",
    time: 8,
    difficulty: "초간단",
    category: "한식",
    kcal: 120,
    ingredients: [
      "달걀 2개",
      "물 달걀 양의 1.5배",
      "소금 1/4작은술",
      "참기름 몇 방울",
      "파 약간",
    ],
    steps: [
      "달걀을 풀고 물, 소금을 넣어 잘 섞습니다.",
      "체에 한 번 걸러 거품을 제거합니다.",
      "랩을 씌우고 전자레인지 500W에서 3분 돌립니다.",
      "참기름과 파를 올려 완성!",
    ],
    tip: "물 비율이 핵심! 달걀 양의 1.5배 물을 넣어야 부드러워요.",
    tag: "생존팁", tagColor: "#4A7FA0", tagBg: "#E8F2F8",
    iconName: "zap", iconColor: "#4A7FA0", thumbBg: "#E8F2F8",
  },
  {
    id: "6",
    name: "아보카도 토스트",
    time: 7,
    difficulty: "초간단",
    category: "양식",
    kcal: 310,
    ingredients: [
      "식빵 2장",
      "아보카도 1/2개",
      "달걀 1개",
      "레몬즙 약간",
      "소금·후추 약간",
      "올리브오일",
    ],
    steps: [
      "식빵을 토스터에 굽습니다.",
      "아보카도를 으깨고 레몬즙, 소금으로 간합니다.",
      "달걀프라이를 만듭니다.",
      "토스트에 아보카도를 바르고 달걀을 올린 후 후추를 뿌립니다.",
    ],
    tip: "아보카도가 잘 익었는지는 꼭지를 눌러 살짝 들어오면 OK!",
    tag: "트렌디", tagColor: "#6B8C6A", tagBg: "#EDF4EC",
    iconName: "coffee", iconColor: "#6B8C6A", thumbBg: "#EDF4EC",
  },
  {
    id: "7",
    name: "냉동밥 볶음밥",
    time: 10,
    difficulty: "쉬움",
    category: "한식",
    kcal: 450,
    ingredients: [
      "냉동밥 1공기",
      "달걀 1개",
      "냉동 야채믹스 한 줌",
      "간장 1큰술",
      "참기름 1/2작은술",
      "소금·후추",
    ],
    steps: [
      "달걀을 스크램블로 만들어 꺼내둡니다.",
      "같은 팬에 야채를 볶습니다.",
      "냉동밥을 전자레인지에 해동 후 팬에 넣고 볶습니다.",
      "달걀, 간장, 참기름을 넣고 섞어 완성!",
    ],
    tip: "밥을 팬에 납작하게 펴서 누른 채로 30초씩 지지면 고슬고슬해져요.",
    tag: "절약", tagColor: "#C8922A", tagBg: "#FDF4E0",
    iconName: "grid", iconColor: "#C8922A", thumbBg: "#FFF8E0",
  },
  {
    id: "8",
    name: "그릭요거트 과일볼",
    time: 5,
    difficulty: "초간단",
    category: "간식",
    kcal: 200,
    ingredients: [
      "그릭요거트 150g",
      "바나나 1/2개",
      "딸기 5개",
      "그래놀라 2큰술",
      "꿀 1작은술",
    ],
    steps: [
      "그릭요거트를 그릇에 담습니다.",
      "과일을 먹기 좋게 자릅니다.",
      "요거트 위에 과일과 그래놀라를 올립니다.",
      "꿀을 뿌리면 완성!",
    ],
    tag: "건강식", tagColor: "#6B8C6A", tagBg: "#EDF4EC",
    iconName: "heart", iconColor: "#6B8C6A", thumbBg: "#EDF4EC",
  },

  // ── 한식 추가 (id 9-22) ─────────────────────────────────
  {
    id: "9", name: "김치볶음밥", time: 10, difficulty: "초간단", category: "한식", kcal: 480,
    ingredients: ["묵은 김치 80g (한 줌)", "찬밥 1공기", "달걀 1개", "참기름 1티스푼", "통깨·식용유 약간"],
    steps: [
      "김치 잘게 썰어 식용유에 2분 볶기 (수분 날리기)",
      "찬밥 넣고 섞으며 살짝 누르기 (3분)",
      "참기름·통깨 마무리, 불 끄기",
      "옆에서 계란프라이 1개 따로 부치기",
    ],
    tip: "김치 너무 시면 설탕 한 꼬집. 김칫국물 살짝 넣으면 깊은 맛.",
    tag: "절약", tagColor: "#C8922A", tagBg: "#FDF4E0",
    iconName: "flame", iconColor: "#C4674A", thumbBg: "#FFECEC",
  },
  {
    id: "10", name: "콩나물국밥", time: 12, difficulty: "쉬움", category: "한식", kcal: 350,
    ingredients: ["콩나물 100g (한 줌)", "밥 1공기", "달걀 1개", "다진 마늘 1/2큰술", "고춧가루 1/2큰술", "국간장 1작은술", "쪽파 약간"],
    steps: [
      "냄비에 물 400ml + 마늘 + 콩나물 넣고 끓이기 (5분)",
      "고춧가루·국간장으로 간 (1분)",
      "밥 1공기 넣고 1분 더 끓이기",
      "달걀 풀어 휘저으며 넣고 쪽파 토핑",
    ],
    tip: "전주식이면 새우젓 1티스푼 추가. 깔끔한 감칠맛.",
    tag: "해장", tagColor: "#C4674A", tagBg: "#FFECEC",
    iconName: "soup", iconColor: "#C4674A", thumbBg: "#FFECEC",
  },
  {
    id: "11", name: "미역국 한 끼", time: 15, difficulty: "쉬움", category: "한식", kcal: 380,
    ingredients: ["건미역 5g (한 줌)", "다진 소고기 50g", "다진 마늘 1/2큰술", "참기름 1큰술", "국간장 1큰술", "밥 1공기"],
    steps: [
      "건미역 찬물에 5분 불리기",
      "냄비에 참기름 + 소고기 + 마늘 볶기 (2분)",
      "불린 미역 넣고 볶기 (2분)",
      "물 500ml + 국간장 넣고 끓이기 (5분)",
      "밥 위에 부어 한 끼 완성",
    ],
    tip: "미역은 5분 이상 불리면 미끌. 짧게 불리는 게 핵심.",
    tag: "정통", tagColor: "#C8922A", tagBg: "#FDF4E0",
    iconName: "soup", iconColor: "#6B8C6A", thumbBg: "#EDF4EC",
  },
  {
    id: "12", name: "된장찌개", time: 18, difficulty: "쉬움", category: "한식", kcal: 420,
    ingredients: ["된장 2큰술", "두부 1/3모", "애호박 1/4개", "양파 1/4개", "감자 1/2개", "다진 마늘 1/2큰술", "멸치 다시팩 1개"],
    steps: [
      "물 500ml에 다시팩 넣고 5분 우리기",
      "다시팩 빼고 된장 풀기, 감자·양파 먼저 넣기",
      "5분 끓인 후 호박·두부 넣고 3분 더",
      "마늘 넣고 1분, 불 끄기",
    ],
    tip: "감자는 먼저, 두부는 마지막. 두부가 너무 오래 끓으면 부서진다.",
    tag: "집밥", tagColor: "#C8922A", tagBg: "#FDF4E0",
    iconName: "soup", iconColor: "#C8922A", thumbBg: "#FDF4E0",
  },
  {
    id: "13", name: "라볶이", time: 12, difficulty: "쉬움", category: "한식", kcal: 620,
    ingredients: ["떡볶이떡 200g", "라면 1/2개", "어묵 2장", "고추장 1.5큰술", "고춧가루 1큰술", "설탕 1큰술", "물 400ml"],
    steps: [
      "물 + 양념 끓이기 (2분)",
      "떡 + 어묵 넣고 5분",
      "라면 깨서 넣고 3분 더",
      "물 줄어들면 완성. 깨·파 토핑 옵션",
    ],
    tip: "라면 스프 1/2만 넣어도 충분. 너무 짜지지 않게.",
    tag: "분식", tagColor: "#C4674A", tagBg: "#FFECEC",
    iconName: "flame", iconColor: "#C4674A", thumbBg: "#FFECEC",
  },
  {
    id: "14", name: "잔반 비빔밥", time: 7, difficulty: "초간단", category: "한식", kcal: 520,
    ingredients: ["밥 1공기", "남은 반찬 3-4가지", "달걀 1개", "고추장 1큰술", "참기름 1티스푼", "통깨 약간"],
    steps: [
      "밥 위에 남은 반찬 보기 좋게 올리기",
      "팬에 계란프라이 (반숙)",
      "반찬 위에 계란 올리기",
      "고추장·참기름 넣고 비비기",
    ],
    tip: "냉장고 정리할 때 최강. 반찬 3가지 이상이면 일단 비빔밥.",
    tag: "잔반정리", tagColor: "#C8922A", tagBg: "#FDF4E0",
    iconName: "layers", iconColor: "#C8922A", thumbBg: "#FDF4E0",
  },
  {
    id: "15", name: "제육볶음", time: 15, difficulty: "쉬움", category: "한식", kcal: 580,
    ingredients: ["제육용 돼지고기 200g", "양파 1/2개", "양배추 100g", "고추장 1큰술", "고춧가루 1큰술", "간장 1큰술", "설탕 1티스푼", "다진 마늘 1/2큰술"],
    steps: [
      "양념 미리 섞어두기 (고추장·고춧가루·간장·설탕·마늘)",
      "팬에 돼지고기 + 양념 볶기 (5분)",
      "양파·양배추 넣고 5분 더 볶기",
      "참기름·깨 마무리, 밥과 함께",
    ],
    tip: "고기 양념은 30분 재우면 더 깊은 맛. 시간 없으면 바로 볶아도 OK.",
    tag: "집밥", tagColor: "#C4674A", tagBg: "#FFECEC",
    iconName: "flame", iconColor: "#C4674A", thumbBg: "#FFECEC",
  },
  {
    id: "16", name: "간단 잡채", time: 25, difficulty: "보통", category: "한식", kcal: 480,
    ingredients: ["당면 100g", "소고기 50g", "양파 1/4개", "당근 1/4개", "시금치 한 줌", "간장 2큰술", "설탕 1큰술", "참기름·통깨"],
    steps: [
      "당면 끓는 물에 8분 삶고 찬물에 헹구기",
      "고기·채소 각각 따로 볶아두기",
      "큰 그릇에 모두 합치고 간장·설탕·참기름으로 무치기",
      "통깨 뿌려 완성",
    ],
    tip: "당면 헹구지 않으면 떡진다. 찬물에 한 번 헹구는 게 핵심.",
    tag: "잔치", tagColor: "#C8922A", tagBg: "#FDF4E0",
    iconName: "package", iconColor: "#C8922A", thumbBg: "#FDF4E0",
  },
  {
    id: "17", name: "카레라이스", time: 20, difficulty: "초간단", category: "한식", kcal: 580,
    ingredients: ["카레 가루 1봉 (또는 고형 카레)", "감자 1개", "양파 1/2개", "당근 1/2개", "닭가슴살 100g (선택)", "물 400ml", "밥 1공기"],
    steps: [
      "감자·당근·양파 큼직하게 깍둑썰기",
      "팬에 닭고기 + 채소 볶기 (5분)",
      "물 붓고 채소 익을 때까지 끓이기 (10분)",
      "카레 가루 풀어 5분 더 끓이기, 밥과 함께",
    ],
    tip: "카레는 한 번에 4인분 만들고 소분 냉동. 다음 끼니 5분 컷.",
    tag: "대량조리", tagColor: "#C8922A", tagBg: "#FDF4E0",
    iconName: "package", iconColor: "#C8922A", thumbBg: "#FDF4E0",
  },
  {
    id: "18", name: "짜장밥", time: 18, difficulty: "쉬움", category: "한식", kcal: 600,
    ingredients: ["짜장 가루 1봉 (또는 춘장 2큰술)", "돼지고기 100g", "양파 1/2개", "양배추 100g", "감자 1/2개", "물 300ml", "밥 1공기"],
    steps: [
      "채소·고기 작게 썰어 볶기 (3분)",
      "춘장 넣고 1분 더 볶기 (춘장은 꼭 볶아야 쓴맛 안 남)",
      "물 + 짜장 가루 풀고 7분 끓이기",
      "밥 위에 끼얹어 완성",
    ],
    tip: "춘장은 반드시 볶는 단계 거치기. 안 그러면 비린 단맛만 남는다.",
    tag: "한식양식", tagColor: "#C4674A", tagBg: "#FFECEC",
    iconName: "package", iconColor: "#C4674A", thumbBg: "#FFECEC",
  },
  {
    id: "19", name: "간단 부대찌개", time: 18, difficulty: "쉬움", category: "한식", kcal: 650,
    ingredients: ["김치 100g", "스팸 1/2캔", "비엔나 5개", "두부 1/3모", "라면사리 1/2개", "고춧가루 1큰술", "다진 마늘 1/2큰술", "물 400ml"],
    steps: [
      "냄비에 김치·스팸·비엔나 깔고 양념 올리기",
      "물 부어 7분 끓이기",
      "두부 + 라면 넣고 4분 더",
      "라면 풀어지면 완성",
    ],
    tip: "재료 다 비주얼로 깔아두면 인스타용. 라면은 마지막 1분에 넣어야 안 퍼진다.",
    tag: "야식", tagColor: "#C4674A", tagBg: "#FFECEC",
    iconName: "soup", iconColor: "#C4674A", thumbBg: "#FFECEC",
  },
  {
    id: "20", name: "간단 닭볶음탕", time: 30, difficulty: "보통", category: "한식", kcal: 620,
    ingredients: ["닭고기 정육 300g", "감자 1개", "양파 1/2개", "당근 1/2개", "고추장 1.5큰술", "고춧가루 1.5큰술", "간장 2큰술", "다진 마늘 1큰술", "물 400ml"],
    steps: [
      "닭고기 끓는 물에 1분 데쳐 잡내 제거",
      "냄비에 양념 + 물 + 닭 + 감자·당근 넣고 15분 끓이기",
      "양파 넣고 10분 더 졸이기",
      "국물 적당히 졸아들면 완성",
    ],
    tip: "데치는 단계 빼면 잡내 남는다. 1분만이라도 꼭.",
    tag: "주말요리", tagColor: "#C4674A", tagBg: "#FFECEC",
    iconName: "flame", iconColor: "#C4674A", thumbBg: "#FFECEC",
  },
  {
    id: "21", name: "만두국", time: 12, difficulty: "초간단", category: "한식", kcal: 420,
    ingredients: ["냉동 만두 8-10개", "다진 마늘 1/2큰술", "국간장 1큰술", "달걀 1개", "김 약간", "쪽파 약간", "물 500ml"],
    steps: [
      "냄비에 물 + 마늘 + 국간장 끓이기",
      "냉동 만두 그대로 넣고 7분 끓이기",
      "달걀 풀어 휘저으며 넣기",
      "김 부수고 쪽파 토핑",
    ],
    tip: "만두 해동 안 해도 OK. 끓는 물에 바로 넣으면 더 쫄깃.",
    tag: "냉동활용", tagColor: "#C8922A", tagBg: "#FDF4E0",
    iconName: "package", iconColor: "#C8922A", thumbBg: "#FDF4E0",
  },
  {
    id: "22", name: "닭가슴살 덮밥", time: 12, difficulty: "쉬움", category: "한식", kcal: 510,
    ingredients: ["닭가슴살 150g", "양파 1/4개", "간장 1.5큰술", "설탕 1큰술", "다진 마늘 1/2큰술", "참기름 1티스푼", "밥 1공기", "달걀 1개"],
    steps: [
      "닭가슴살 한 입 크기로 썰기",
      "팬에 양파 볶고 닭고기 + 양념 넣어 7분 졸이기",
      "참기름 마무리",
      "밥 위에 올리고 반숙 계란프라이 토핑",
    ],
    tip: "닭가슴살이 퍽퍽하면 우유에 5분 재우기. 부드러워진다.",
    tag: "단백질", tagColor: "#6B8C6A", tagBg: "#EDF4EC",
    iconName: "zap", iconColor: "#6B8C6A", thumbBg: "#EDF4EC",
  },

  // ── 양식 추가 (id 23-30) ────────────────────────────────
  {
    id: "23", name: "알리오 올리오", time: 12, difficulty: "초간단", category: "양식", kcal: 510,
    ingredients: ["스파게티 100g", "마늘 5쪽", "올리브오일 3큰술", "페퍼론치노 3개 (또는 고춧가루)", "소금·후추", "파슬리 약간"],
    steps: [
      "끓는 소금물에 스파게티 8분 삶기",
      "팬에 올리브오일 + 슬라이스 마늘 약불 (2분)",
      "마늘 노릇해지면 페퍼론치노 추가",
      "면수 1국자 + 면 넣고 1분 볶기, 파슬리 마무리",
    ],
    tip: "마늘 태우지 않는 게 핵심. 약불 유지 + 면수가 소스 비결.",
    tag: "이탈리안", tagColor: "#6B8C6A", tagBg: "#EDF4EC",
    iconName: "leaf", iconColor: "#6B8C6A", thumbBg: "#EDF4EC",
  },
  {
    id: "24", name: "토마토 파스타", time: 15, difficulty: "쉬움", category: "양식", kcal: 540,
    ingredients: ["스파게티 100g", "토마토소스 100g (병 또는 캔)", "마늘 3쪽", "양파 1/4개", "올리브오일 1큰술", "소금·후추·파슬리"],
    steps: [
      "스파게티 8분 삶기",
      "팬에 마늘·양파 볶기 (3분)",
      "토마토소스 넣고 5분 졸이기",
      "면 넣고 1분 버무리기, 파슬리 토핑",
    ],
    tip: "시판 토마토소스에 설탕 한 꼬집 넣으면 산미가 부드러워진다.",
    tag: "이탈리안", tagColor: "#C4674A", tagBg: "#FFECEC",
    iconName: "heart", iconColor: "#C4674A", thumbBg: "#FFECEC",
  },
  {
    id: "25", name: "1인 까르보나라", time: 15, difficulty: "쉬움", category: "양식", kcal: 680,
    ingredients: ["스파게티 100g", "베이컨 4줄", "달걀 1개 (노른자만 추가 1개)", "파마산 치즈 3큰술", "후추 듬뿍", "소금"],
    steps: [
      "스파게티 8분 삶기",
      "베이컨 바삭하게 굽기 (4분)",
      "그릇에 달걀 + 치즈 + 후추 미리 섞어두기",
      "면 + 베이컨 + 달걀 소스 빠르게 비비기 (불 끄고)",
    ],
    tip: "달걀은 반드시 불 끄고 섞기. 안 그러면 스크램블 됨.",
    tag: "특별한날", tagColor: "#C4674A", tagBg: "#FFECEC",
    iconName: "heart", iconColor: "#C4674A", thumbBg: "#FFECEC",
  },
  {
    id: "26", name: "그릴드 치즈", time: 7, difficulty: "초간단", category: "양식", kcal: 380,
    ingredients: ["식빵 2장", "체다 슬라이스 2장", "버터 1큰술 (또는 마요)", "후추 약간"],
    steps: [
      "식빵 한 면에 버터 바르기",
      "버터 면이 바깥으로 가게 → 안쪽에 치즈 끼우기",
      "약불 팬에 노릇하게 굽기 (앞뒤 2분씩)",
      "치즈 녹으면 완성",
    ],
    tip: "버터 대신 마요네즈 바르면 더 바삭. 미국식 정석 레시피.",
    tag: "간편", tagColor: "#C8922A", tagBg: "#FDF4E0",
    iconName: "sandwich", iconColor: "#C8922A", thumbBg: "#FDF4E0",
  },
  {
    id: "27", name: "햄치즈 토스트", time: 6, difficulty: "초간단", category: "양식", kcal: 410,
    ingredients: ["식빵 2장", "햄 2장", "체다 슬라이스 1장", "버터 1티스푼", "달걀 1개 (옵션)"],
    steps: [
      "식빵 토스터에 굽기",
      "팬에 버터 녹이고 햄 살짝 굽기 (선택: 계란프라이 추가)",
      "토스트 → 햄 → 치즈 → 토스트 순으로 쌓기",
      "반으로 잘라 완성",
    ],
    tip: "치즈는 햄 위에 올려야 햄 열로 반쯤 녹는다. 식빵 사이에 두지 마.",
    tag: "아침", tagColor: "#C8922A", tagBg: "#FDF4E0",
    iconName: "sandwich", iconColor: "#C8922A", thumbBg: "#FDF4E0",
  },
  {
    id: "28", name: "마요 샌드위치", time: 8, difficulty: "초간단", category: "양식", kcal: 440,
    ingredients: ["식빵 2장", "참치캔 1/2개", "양상추 한 줌", "마요네즈 2큰술", "후추 약간", "오이 슬라이스 (옵션)"],
    steps: [
      "참치캔 기름 빼기",
      "참치 + 마요 + 후추 섞기",
      "식빵 위에 양상추 깔고 참치 마요 → 식빵",
      "대각선으로 잘라 완성",
    ],
    tip: "참치 기름 안 빼면 빵이 눅눅해진다. 키친타올로 한 번 더 짜내기.",
    tag: "도시락", tagColor: "#C8922A", tagBg: "#FDF4E0",
    iconName: "sandwich", iconColor: "#6B8C6A", thumbBg: "#EDF4EC",
  },
  {
    id: "29", name: "토르티야 부리또", time: 10, difficulty: "쉬움", category: "양식", kcal: 520,
    ingredients: ["토르티야 1장 (대형)", "참치캔 1/2개 또는 닭가슴살", "양상추·토마토·아보카도", "마요·핫소스", "치즈 1줌"],
    steps: [
      "토르티야 마른 팬에 30초 데우기",
      "재료 일렬로 올리기 (양상추 → 단백질 → 채소 → 치즈)",
      "한쪽 끝부터 단단히 말기",
      "팬에 30초 더 굽기 (선택)",
    ],
    tip: "재료 너무 많이 넣으면 못 만다. 한 줄에 알맞게.",
    tag: "트렌디", tagColor: "#6B8C6A", tagBg: "#EDF4EC",
    iconName: "package", iconColor: "#6B8C6A", thumbBg: "#EDF4EC",
  },
  {
    id: "30", name: "새우 알리오 올리오", time: 13, difficulty: "쉬움", category: "양식", kcal: 560,
    ingredients: ["스파게티 100g", "냉동 새우 8마리", "마늘 5쪽", "올리브오일 3큰술", "페퍼론치노 3개", "소금·파슬리"],
    steps: [
      "스파게티 8분 삶기",
      "팬에 올리브오일 + 마늘 약불 (2분)",
      "해동한 새우 + 페퍼론치노 넣고 3분",
      "면 + 면수 1국자 + 파슬리로 마무리",
    ],
    tip: "냉동 새우는 냉장 해동 권장. 시간 없으면 찬물에 5분.",
    tag: "특별한날", tagColor: "#C4674A", tagBg: "#FFECEC",
    iconName: "heart", iconColor: "#C4674A", thumbBg: "#FFECEC",
  },

  // ── 샐러드·다이어트 추가 (id 31-37) ─────────────────────
  {
    id: "31", name: "닭가슴살 샐러드", time: 8, difficulty: "초간단", category: "샐러드", kcal: 320,
    ingredients: ["조리된 닭가슴살 1팩 (100g)", "양상추 한 줌", "방울토마토 5개", "오이 1/2개", "올리브오일·발사믹·후추"],
    steps: [
      "닭가슴살 결대로 찢거나 큼직하게 썰기",
      "양상추 한 입 크기로 뜯기",
      "방울토마토·오이 자르기",
      "그릇에 모두 담고 드레싱 뿌리기",
    ],
    tip: "조리된 닭가슴살 (마트 즉석) 활용 = 5분 컷. 단백질 25g 확보.",
    tag: "다이어트", tagColor: "#6B8C6A", tagBg: "#EDF4EC",
    iconName: "salad", iconColor: "#6B8C6A", thumbBg: "#EDF4EC",
  },
  {
    id: "32", name: "오트밀 단백질 죽", time: 8, difficulty: "초간단", category: "샐러드", kcal: 350,
    ingredients: ["오트밀 50g", "우유 200ml", "프로틴 파우더 1스쿱 (옵션)", "바나나 1/2개", "꿀 1티스푼", "시나몬 가루 약간"],
    steps: [
      "냄비에 오트밀 + 우유 끓이기 (3분)",
      "걸쭉해지면 약불로 줄이고 프로틴 가루 풀기",
      "바나나 슬라이스 올리기",
      "꿀·시나몬 토핑",
    ],
    tip: "우유 대신 두유로 바꾸면 -50kcal + 락토프리. 다이어트용 강추.",
    tag: "단백질", tagColor: "#6B8C6A", tagBg: "#EDF4EC",
    iconName: "leaf", iconColor: "#6B8C6A", thumbBg: "#EDF4EC",
  },
  {
    id: "33", name: "양배추 쌈밥", time: 12, difficulty: "초간단", category: "샐러드", kcal: 380,
    ingredients: ["양배추 잎 5장", "현미밥 1/2공기", "참치캔 1/2개", "쌈장 1큰술", "마늘·고추 (옵션)"],
    steps: [
      "양배추 잎 끓는 물에 1분 데치기",
      "참치 기름 빼고 쌈장과 섞기",
      "양배추에 밥 + 참치쌈장 한 숟가락 올리기",
      "쌈처럼 싸 먹기",
    ],
    tip: "양배추 데치면 단맛 나오고 부드러워짐. 데치지 않으면 너무 질김.",
    tag: "저칼로리", tagColor: "#6B8C6A", tagBg: "#EDF4EC",
    iconName: "leaf", iconColor: "#6B8C6A", thumbBg: "#EDF4EC",
  },
  {
    id: "34", name: "두부 오믈렛", time: 10, difficulty: "쉬움", category: "샐러드", kcal: 280,
    ingredients: ["두부 1/2모", "달걀 2개", "양파 1/4개", "다진 햄 (옵션)", "소금·후추·올리브오일"],
    steps: [
      "두부 으깨고 키친타올로 물기 빼기",
      "달걀 풀고 두부 + 양파 + 양념 섞기",
      "팬에 올리브오일 두르고 부치기 (앞뒤 3분)",
      "반 접어 완성",
    ],
    tip: "두부가 단백질 보강. 일반 오믈렛보다 +10g 단백질.",
    tag: "단백질", tagColor: "#6B8C6A", tagBg: "#EDF4EC",
    iconName: "zap", iconColor: "#6B8C6A", thumbBg: "#EDF4EC",
  },
  {
    id: "35", name: "단호박 스프", time: 25, difficulty: "쉬움", category: "샐러드", kcal: 220,
    ingredients: ["단호박 1/4개 (300g)", "양파 1/4개", "우유 200ml", "버터 1큰술", "소금·후추", "파마산 치즈 (옵션)"],
    steps: [
      "단호박 껍질 벗기고 큼직하게 썰기",
      "팬에 버터 + 양파 + 단호박 볶기 (5분)",
      "물 200ml 붓고 단호박 익을 때까지 (10분)",
      "블렌더에 갈고 우유 추가, 5분 더 끓이기",
    ],
    tip: "블렌더 없으면 으깨도 된다. 단호박은 전자레인지 5분이면 더 빨라.",
    tag: "건강식", tagColor: "#6B8C6A", tagBg: "#EDF4EC",
    iconName: "soup", iconColor: "#C8922A", thumbBg: "#FDF4E0",
  },
  {
    id: "36", name: "시금치 두부무침", time: 10, difficulty: "쉬움", category: "샐러드", kcal: 180,
    ingredients: ["시금치 한 단", "두부 1/3모", "다진 마늘 1/2큰술", "참기름 1큰술", "국간장 1티스푼", "통깨"],
    steps: [
      "시금치 끓는 물에 30초 데치고 찬물 헹구기",
      "물기 꽉 짜고 한 입 크기로 자르기",
      "두부 으깨고 양념 모두 섞기",
      "통깨 뿌려 완성",
    ],
    tip: "시금치 너무 오래 데치면 뭉그러진다. 30초면 충분.",
    tag: "반찬", tagColor: "#6B8C6A", tagBg: "#EDF4EC",
    iconName: "leaf", iconColor: "#6B8C6A", thumbBg: "#EDF4EC",
  },
  {
    id: "37", name: "콩나물밥", time: 25, difficulty: "쉬움", category: "샐러드", kcal: 380,
    ingredients: ["쌀 1컵", "콩나물 200g", "양념간장(간장 2큰술·고춧가루·다진 마늘·참기름·쪽파)"],
    steps: [
      "쌀 씻어 30분 불리기",
      "전기밥솥에 쌀 + 물(평소보다 적게) + 콩나물 올리고 취사",
      "양념간장 미리 만들어두기",
      "다 되면 비벼 양념간장 뿌려 먹기",
    ],
    tip: "콩나물 수분 때문에 물 1/3 줄이는 게 핵심. 양념간장이 생명.",
    tag: "한그릇", tagColor: "#C8922A", tagBg: "#FDF4E0",
    iconName: "package", iconColor: "#6B8C6A", thumbBg: "#EDF4EC",
  },

  // ── 간식·야식 추가 (id 38-43) ───────────────────────────
  {
    id: "38", name: "떡볶이", time: 12, difficulty: "쉬움", category: "간식", kcal: 480,
    ingredients: ["떡 200g", "어묵 2장", "고추장 2큰술", "고춧가루 1큰술", "설탕 1큰술", "다진 마늘 1/2큰술", "물 400ml"],
    steps: [
      "물 + 양념 끓이기 (2분)",
      "떡 + 어묵 넣고 8분 졸이기",
      "물이 1/3 남을 때까지",
      "쪽파·깨 토핑",
    ],
    tip: "떡 굳어있으면 미지근한 물에 5분 불리기. 찰진 식감 회복.",
    tag: "분식", tagColor: "#C4674A", tagBg: "#FFECEC",
    iconName: "flame", iconColor: "#C4674A", thumbBg: "#FFECEC",
  },
  {
    id: "39", name: "어묵탕", time: 12, difficulty: "초간단", category: "간식", kcal: 220,
    ingredients: ["어묵 5장", "무 1/4개 (옵션)", "다시팩 1개", "국간장 1큰술", "다진 마늘 1/2큰술", "물 600ml", "쪽파"],
    steps: [
      "물에 다시팩 + 무 5분 끓이기",
      "다시팩 빼고 어묵 + 양념 넣기",
      "5분 더 끓이기",
      "쪽파 토핑",
    ],
    tip: "어묵 끓는 물에 한 번 살짝 데치면 기름기 빠진다. 깔끔한 국물.",
    tag: "야식", tagColor: "#4A7FA0", tagBg: "#E8F2F8",
    iconName: "soup", iconColor: "#4A7FA0", thumbBg: "#E8F2F8",
  },
  {
    id: "40", name: "에어프라이어 군고구마", time: 30, difficulty: "초간단", category: "간식", kcal: 160,
    ingredients: ["고구마 2개 (200g)", "물 약간", "포일 (선택)"],
    steps: [
      "고구마 깨끗이 씻고 물기 살짝 (포일 감싸면 더 촉촉)",
      "에어프라이어 200°C에서 25-30분",
      "젓가락이 부드럽게 들어가면 완성",
      "반으로 갈라 먹기",
    ],
    tip: "에어프라이어 없으면 전자레인지 6분 + 토스터 5분도 가능.",
    tag: "건강간식", tagColor: "#C8922A", tagBg: "#FDF4E0",
    iconName: "sun", iconColor: "#C8922A", thumbBg: "#FDF4E0",
  },
  {
    id: "41", name: "즉석 김밥", time: 15, difficulty: "쉬움", category: "간식", kcal: 460,
    ingredients: ["김 2장", "밥 1공기", "단무지 4쪽", "햄 2장", "달걀 1개", "참기름·소금·통깨"],
    steps: [
      "밥에 참기름·소금·통깨 섞기",
      "달걀 풀어 부쳐 길게 썰기",
      "김 위에 밥 펴고 단무지·햄·달걀 올려 말기",
      "한 입 크기로 자르기",
    ],
    tip: "김밥은 만들고 5분 후 자르는 게 깨끗. 바로 자르면 으깨진다.",
    tag: "도시락", tagColor: "#C8922A", tagBg: "#FDF4E0",
    iconName: "package", iconColor: "#C8922A", thumbBg: "#FDF4E0",
  },
  {
    id: "42", name: "냉동 만두 굽기", time: 8, difficulty: "초간단", category: "간식", kcal: 380,
    ingredients: ["냉동 만두 8개", "물 50ml", "식용유 1큰술", "간장·식초·고춧가루 (찍먹용)"],
    steps: [
      "팬에 식용유 두르고 만두 일렬 배치 (해동 X)",
      "물 50ml 붓고 뚜껑 닫아 5분 (찜효과)",
      "뚜껑 열고 물 증발할 때까지 굽기 (2분)",
      "양념장 만들어 찍먹",
    ],
    tip: "물 50ml가 핵심. 너무 많으면 눅눅, 적으면 탄다. 정확히 50ml.",
    tag: "냉동활용", tagColor: "#C4674A", tagBg: "#FFECEC",
    iconName: "package", iconColor: "#C4674A", thumbBg: "#FFECEC",
  },
  {
    id: "43", name: "라떼 (홈카페)", time: 5, difficulty: "초간단", category: "간식", kcal: 140,
    ingredients: ["인스턴트 커피 1봉 또는 에스프레소 가루 1티스푼", "우유 200ml", "설탕 (선택)", "시나몬 가루 (옵션)"],
    steps: [
      "전자레인지로 우유 1분 30초 데우기",
      "거품기로 우유 30초 휘젓기 (거품)",
      "커피 가루를 컵에 넣고 뜨거운 물 50ml로 풀기",
      "우유 + 거품 부어 마무리",
    ],
    tip: "거품기 없으면 머그컵 뚜껑 닫고 20초 흔들기. 비슷한 거품 나옴.",
    tag: "홈카페", tagColor: "#C8922A", tagBg: "#FDF4E0",
    iconName: "coffee", iconColor: "#C8922A", thumbBg: "#FDF4E0",
  },

  // ── 일식·아시안 (id 44-50) ──────────────────────────────
  {
    id: "44", name: "오야코동", time: 15, difficulty: "쉬움", category: "일식", kcal: 580,
    ingredients: ["닭정육 150g", "양파 1/2개", "달걀 2개", "간장 2큰술", "맛술 1큰술", "설탕 1큰술", "물 100ml", "밥 1공기", "쪽파"],
    steps: [
      "닭정육 한 입 크기로 자르기",
      "팬에 양파 + 닭 + 양념 + 물 졸이기 (8분)",
      "달걀 풀어 휘저으며 부어 1분 익히기 (반숙)",
      "밥 위에 끼얹고 쪽파 토핑",
    ],
    tip: "달걀은 반드시 반숙. 너무 익으면 일식 본연의 맛이 안 난다.",
    tag: "정통일식", tagColor: "#4A7FA0", tagBg: "#E8F2F8",
    iconName: "package", iconColor: "#4A7FA0", thumbBg: "#E8F2F8",
  },
  {
    id: "45", name: "간단 가츠동", time: 18, difficulty: "쉬움", category: "일식", kcal: 720,
    ingredients: ["돈가스 (즉석 또는 조리된 거) 1장", "양파 1/2개", "달걀 2개", "간장 2큰술", "설탕 1큰술", "물 100ml", "밥 1공기"],
    steps: [
      "돈가스 토스터/에어프라이어 5분 데우기",
      "팬에 양파 + 양념 + 물 졸이기 (5분)",
      "돈가스 한 입 크기로 자르고 양념에 올리기",
      "달걀 풀어 부어 반숙으로 익히기, 밥 위에",
    ],
    tip: "돈가스는 미리 조리된 거 쓰면 18분 컷. 직접 튀기지 않아도 OK.",
    tag: "정통일식", tagColor: "#4A7FA0", tagBg: "#E8F2F8",
    iconName: "package", iconColor: "#4A7FA0", thumbBg: "#E8F2F8",
  },
  {
    id: "46", name: "간단 우동", time: 8, difficulty: "초간단", category: "일식", kcal: 480,
    ingredients: ["우동면 1봉 (생면 또는 냉동)", "다시팩 1개", "간장 1.5큰술", "맛술 1큰술", "달걀 1개 (옵션)", "쪽파·김"],
    steps: [
      "물 500ml에 다시팩 5분 우리기",
      "다시팩 빼고 간장·맛술로 간",
      "우동면 넣고 3분 끓이기",
      "달걀 풀어 넣고 쪽파·김 토핑",
    ],
    tip: "우동 국물은 다시팩이 핵심. 멸치+다시마 조합이 정통.",
    tag: "정통일식", tagColor: "#4A7FA0", tagBg: "#E8F2F8",
    iconName: "soup", iconColor: "#4A7FA0", thumbBg: "#E8F2F8",
  },
  {
    id: "47", name: "야키소바", time: 12, difficulty: "쉬움", category: "일식", kcal: 540,
    ingredients: ["야키소바 면 1봉 (또는 라면면 그냥)", "양배추 1/4개", "당근 1/4개", "베이컨 3줄", "야키소바 소스 2큰술 (또는 우스터+굴소스)", "후추"],
    steps: [
      "면 끓는 물에 1분 풀고 헹구기",
      "팬에 베이컨 + 양배추·당근 채썰어 볶기 (3분)",
      "면 넣고 소스로 간하며 3분 더",
      "후추로 마무리",
    ],
    tip: "면 끝에 한 번 헹구는 게 중요. 안 그러면 떡진다.",
    tag: "포장마차", tagColor: "#4A7FA0", tagBg: "#E8F2F8",
    iconName: "flame", iconColor: "#C4674A", thumbBg: "#FFECEC",
  },
  {
    id: "48", name: "일본식 카레", time: 22, difficulty: "쉬움", category: "일식", kcal: 620,
    ingredients: ["일본 고형 카레 2조각", "돼지고기 100g", "감자 1개", "양파 1/2개", "당근 1/2개", "물 400ml", "밥 1공기"],
    steps: [
      "고기·채소 큼직하게 썰기",
      "팬에 고기 + 채소 볶기 (5분)",
      "물 부어 채소 익을 때까지 (10분)",
      "고형 카레 풀고 7분 더 끓이기",
    ],
    tip: "한국 카레보다 단맛 + 진하다. 일본식 핵심은 고형 카레.",
    tag: "정통일식", tagColor: "#C8922A", tagBg: "#FDF4E0",
    iconName: "package", iconColor: "#C8922A", thumbBg: "#FDF4E0",
  },
  {
    id: "49", name: "오니기리", time: 8, difficulty: "초간단", category: "일식", kcal: 280,
    ingredients: ["밥 1공기", "참치캔 1/2개 + 마요 1큰술 (또는 명란·우메보시)", "김 1장", "소금 약간", "참기름 (옵션)"],
    steps: [
      "밥에 소금 살짝 섞기",
      "손에 물 묻혀 밥 1/2 펼치기",
      "가운데 속 재료 넣고 둥글게 또는 삼각형으로 모양 잡기",
      "김으로 감싸 완성",
    ],
    tip: "일식랩 (오니기리용) 없으면 그냥 손으로 OK. 손에 물 + 소금이 핵심.",
    tag: "도시락", tagColor: "#4A7FA0", tagBg: "#E8F2F8",
    iconName: "package", iconColor: "#4A7FA0", thumbBg: "#E8F2F8",
  },
  {
    id: "50", name: "간단 미소국", time: 10, difficulty: "초간단", category: "일식", kcal: 90,
    ingredients: ["미소된장 1.5큰술", "두부 1/3모", "건미역 한 줌", "다시팩 1개 (또는 가쓰오부시)", "쪽파"],
    steps: [
      "물 400ml + 다시팩 5분 우리기",
      "다시팩 빼고 미소된장 풀기 (끓이지 말 것)",
      "두부·미역 넣고 1분",
      "쪽파 토핑",
    ],
    tip: "미소된장은 절대 팔팔 끓이지 말 것. 향과 영양이 날아간다.",
    tag: "정통일식", tagColor: "#4A7FA0", tagBg: "#E8F2F8",
    iconName: "soup", iconColor: "#4A7FA0", thumbBg: "#E8F2F8",
  },
];

export function findRecipe(id: string): Recipe | undefined {
  return RECIPES.find((r) => r.id === id);
}
