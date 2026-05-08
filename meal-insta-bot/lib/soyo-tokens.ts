/**
 * 소요(Soyo) 앱 디자인 토큰을 카드뉴스에 그대로 복제.
 * 원본: C:/Users/chosh/Desktop/soyo/constants/Colors.ts
 *
 * 카드뉴스가 소요 앱 트래픽 유도 콘텐츠이므로 컬러·폰트는 앱과 100% 일치시켜
 * "이 카드뉴스 → 소요 앱"의 시각적 일관성을 확보한다.
 */

export const SoyoColors = {
  // Paper tones (배경)
  paper: "#FAF8F3",
  paper2: "#F3EFE5",
  paper3: "#EAE4D6",

  // Ink tones (텍스트)
  ink: "#1C1810",
  ink2: "#4A3F30",
  ink3: "#8A7A68",

  // Accent (카테고리·강조)
  gold: "#C8922A",
  goldLt: "#E8B84B",
  goldBg: "#FDF4E0",

  sage: "#6B8C6A",
  sageBg: "#EDF4EC",

  clay: "#C4674A",
  clayBg: "#FAEEE9",

  sky: "#4A7FA0",
  skyBg: "#E8F2F8",

  purple: "#7B6BB5",
  purpleBg: "#F3EEFF",

  white: "#FFFFFF",
} as const;

/**
 * 소요 앱 폰트 패밀리.
 * - 제목: NotoSerifKR_700Bold (recipe-detail의 sectionTitle, 카드뉴스 headline)
 * - 본문: NotoSansKR (ingredient·step·tip 등)
 */
export const SoyoFonts = {
  serif:
    '"Noto Serif KR", "Noto Serif Korean", "Nanum Myeongjo", serif',
  sans: '"Noto Sans KR", "Noto Sans Korean", "Pretendard", system-ui, sans-serif',
} as const;

/**
 * 소요 앱 딥링크 (인스타 → 앱).
 * 실제 배포 시 도메인·UTM 파라미터 추가.
 */
export const SoyoLinks = {
  // TODO: 실제 인스타 핸들로 교체
  instagramHandle: "@soyo.recipe",
  // TODO: 실제 앱 도메인으로 교체 (현재는 로컬)
  recipeDetail: (id: string) => `soyo://recipe-detail?id=${id}`,
  recipeDetailWeb: (id: string) =>
    `https://soyo.app/recipe-detail?id=${id}`,
} as const;

/**
 * 소요 앱의 4가지 핵심 기능 — 카드뉴스 마지막 CTA에 매핑.
 * 각 기능을 자취인 페인포인트와 1:1 연결.
 */
export const SoyoFeatures = [
  { name: "레시피", pain: "혼자 먹는 한 끼 필요하면" },
  { name: "장보기", pain: "1인분 장보기 막막하면" },
  { name: "영양분석", pain: "잘 먹고 있나 궁금하면" },
  { name: "빠른요리", pain: "귀찮음에 빠른 끼니 필요하면" },
] as const;
