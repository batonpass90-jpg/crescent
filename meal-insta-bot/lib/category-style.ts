import type { ContentCategory } from "./content-types";
import { SoyoColors } from "./soyo-tokens";

export interface CategoryStyle {
  label: string;
  bandColor: string;
  accentColor: string;
}

/**
 * 카테고리별 강조색을 소요 앱 accent 팔레트와 매핑.
 * - today_meal → clay (오늘의 픽 태그와 동일)
 * - weekly_menu → sage (건강식 태그와 동일)
 * - diet_info → sky (생존팁 태그와 동일)
 */
export const CATEGORY_STYLES: Record<ContentCategory, CategoryStyle> = {
  today_meal: {
    label: "오늘의 한 끼",
    bandColor: SoyoColors.clay,
    accentColor: SoyoColors.clay,
  },
  weekly_menu: {
    label: "이번 주 식단표",
    bandColor: SoyoColors.sage,
    accentColor: SoyoColors.sage,
  },
  diet_info: {
    label: "식단 정보",
    bandColor: SoyoColors.sky,
    accentColor: SoyoColors.sky,
  },
};
