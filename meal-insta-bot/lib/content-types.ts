export type ContentCategory = "weekly_menu" | "diet_info" | "today_meal";

export const CATEGORY_LABELS: Record<ContentCategory, string> = {
  weekly_menu: "일주일 식단표",
  diet_info: "식단 정보",
  today_meal: "오늘의 한 끼",
};

export interface CardDetailRow {
  label: string;
  value: string;
}

export interface CardCallout {
  tone: "tip" | "warn";
  text: string;
}

export interface CardContent {
  headline: string;
  body: string;
  image_concept: string;
  subtitle?: string;
  rows?: CardDetailRow[];
  steps?: string[];
  callout?: CardCallout;
}

export interface CardNewsContent {
  title: string;
  cards: CardContent[];
  caption: string;
  hashtags: string[];
}

export interface GenerateContentRequest {
  category: ContentCategory;
  date: string;
}

export interface GenerateContentResponse {
  category: ContentCategory;
  date: string;
  content: CardNewsContent;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_read_input_tokens?: number;
  };
}
