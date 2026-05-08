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
  // ✅ Wikimedia 시각 확인: 빨간 볶음밥 + 계란프라이 + 콩나물 + 깨 (정확)
  김치볶음밥: wikimedia("Korean_cuisine-Kimchi_bokkeumbap-01.jpg", "0/0d"),

  // 한식 (Wikimedia에 잘 정리된 음식들)
  김치찌개: wikimedia("Korean_stew-Kimchi_jjigae-02.jpg", "9/9b"),
  달걀찜: wikimedia("Korean_steamed_egg-Gyeran_jjim-01.jpg", "0/0e"),
  냉동밥볶음밥: wikimedia("Bokkeumbap.jpg", "f/f6"),

  // 양식·간식·샐러드 (Unsplash)
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

const GENERIC_FOOD_PHOTO =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c" + UNSPLASH_OPT;

export function photoFor(recipe: Recipe): string {
  if (recipe.photoUrl) return recipe.photoUrl;
  const key = recipe.name.replace(/\s+/g, "");
  return FOOD_PHOTOS[key] ?? GENERIC_FOOD_PHOTO;
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
    tag: "건강식",
    tagColor: "#6B8C6A",
    tagBg: "#EDF4EC",
    iconName: "map-pin",
    iconColor: "#6B8C6A",
    thumbBg: "#EDF4EC",
  },
];

export function findRecipe(id: string): Recipe | undefined {
  return RECIPES.find((r) => r.id === id);
}
