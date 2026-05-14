/**
 * 단일 카드를 native 1080×1350으로 렌더 — Puppeteer 스크린샷 전용.
 *
 * 사용:
 *   /render?source=recipe:1&i=0       → soyo RECIPES[id=1]의 0번 카드
 *   /render?source=sample:today_meal&i=3  → 김치볶음밥 샘플 3번 카드
 *
 * 페이지 chrome(헤더·여백) 없이 카드만 1080×1350 영역에 가득 차게 출력.
 */

import { CardCover } from "@/components/CardCover";
import { CardContent } from "@/components/CardContent";
import { CARD_WIDTH, CARD_HEIGHT } from "@/components/CardTemplate";
import { CATEGORY_STYLES } from "@/lib/category-style";
import { SAMPLE_BY_CATEGORY } from "@/lib/sample-content";
import { findRecipe, photoFor } from "@/lib/recipe-source";
import { recipeToCards } from "@/lib/recipe-to-cards";
import { findWeeklyMenu } from "@/lib/weekly-menus";
import { weeklyMenuToCards } from "@/lib/menu-to-cards";
import { findDietInfo } from "@/lib/diet-infos";
import { dietInfoToCards } from "@/lib/info-to-cards";
import { findLifestylePost } from "@/lib/lifestyle-posts";
import { lifestyleToCards } from "@/lib/lifestyle-to-cards";
import { findHackPost } from "@/lib/hack-posts";
import { hackToCards } from "@/lib/hack-to-cards";
import { findChallengePost } from "@/lib/challenge-posts";
import { challengeToCards } from "@/lib/challenge-to-cards";
import { findComparePost } from "@/lib/compare-posts";
import { compareToCards } from "@/lib/compare-to-cards";
import { findTruthPost } from "@/lib/truth-posts";
import { truthToCards } from "@/lib/truth-to-cards";
import { SoyoLinks } from "@/lib/soyo-tokens";
import type { CardNewsContent, ContentCategory } from "@/lib/content-types";

interface RenderSearchParams {
  source?: string;
  i?: string;
  handle?: string;
}

interface ResolvedDeck {
  content: CardNewsContent;
  category: ContentCategory;
  photoUrl: string;
  /** 상단 카테고리 라벨 override (CATEGORY_STYLES 대신 사용) */
  labelOverride?: string;
  /** 밴드 컬러 override */
  bandColorOverride?: string;
}

function resolve(source: string): ResolvedDeck | null {
  if (source.startsWith("recipe:")) {
    const id = source.slice("recipe:".length);
    const recipe = findRecipe(id);
    if (!recipe) return null;
    return {
      content: recipeToCards(recipe),
      category: "today_meal",
      photoUrl: photoFor(recipe),
    };
  }
  if (source.startsWith("weekly:")) {
    const id = source.slice("weekly:".length);
    const menu = findWeeklyMenu(id);
    if (!menu) return null;
    return {
      content: weeklyMenuToCards(menu),
      category: "weekly_menu",
      // 주간 식단표 커버 사진 — 카테고리별 fallback
      photoUrl:
        "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1080&h=1350&fit=crop",
    };
  }
  if (source.startsWith("diet:")) {
    const id = source.slice("diet:".length);
    const info = findDietInfo(id);
    if (!info) return null;
    return {
      content: dietInfoToCards(info),
      category: "diet_info",
      photoUrl:
        "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1080&h=1350&fit=crop",
    };
  }
  if (source.startsWith("lifestyle:")) {
    const id = source.slice("lifestyle:".length);
    const post = findLifestylePost(id);
    if (!post) return null;
    return {
      content: lifestyleToCards(post),
      category: "diet_info", // 컬러는 diet와 동일 (sky)
      photoUrl:
        "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1080&h=1350&fit=crop",
    };
  }
  if (source.startsWith("hack:")) {
    const id = source.slice("hack:".length);
    const post = findHackPost(id);
    if (!post) return null;
    return {
      content: hackToCards(post),
      category: "weekly_menu", // 컬러는 weekly와 동일 (sage)
      photoUrl: "",
    };
  }
  if (source.startsWith("challenge:")) {
    const id = source.slice("challenge:".length);
    const post = findChallengePost(id);
    if (!post) return null;
    return {
      content: challengeToCards(post),
      category: "today_meal",
      photoUrl: "",
      labelOverride: "30일 챌린지",
    };
  }
  if (source.startsWith("compare:")) {
    const id = source.slice("compare:".length);
    const post = findComparePost(id);
    if (!post) return null;
    return {
      content: compareToCards(post),
      category: "diet_info",
      photoUrl: "",
      labelOverride: "전후 비교",
    };
  }
  if (source.startsWith("truth:")) {
    const id = source.slice("truth:".length);
    const post = findTruthPost(id);
    if (!post) return null;
    return {
      content: truthToCards(post),
      category: "today_meal",
      photoUrl: "",
      labelOverride: "숨겨진 진실",
    };
  }
  if (source.startsWith("sample:")) {
    const cat = source.slice("sample:".length) as ContentCategory;
    const content = SAMPLE_BY_CATEGORY[cat];
    if (!content) return null;
    return {
      content,
      category: cat,
      photoUrl:
        cat === "today_meal"
          ? "https://upload.wikimedia.org/wikipedia/commons/0/0d/Korean_cuisine-Kimchi_bokkeumbap-01.jpg"
          : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1080&h=1350&fit=crop",
    };
  }
  return null;
}

export default async function RenderPage({
  searchParams,
}: {
  searchParams: Promise<RenderSearchParams>;
}) {
  const params = await searchParams;
  const source = params.source ?? "recipe:1";
  const i = parseInt(params.i ?? "0", 10);
  const handle = params.handle ?? SoyoLinks.instagramHandle;

  const deck = resolve(source);
  if (!deck) {
    return (
      <div style={{ padding: 32, fontFamily: "monospace" }}>
        Unknown source: {source}
        <br />
        Use ?source=recipe:&lt;id&gt; or ?source=sample:&lt;category&gt;
      </div>
    );
  }

  const card = deck.content.cards[i];
  if (!card) {
    return (
      <div style={{ padding: 32, fontFamily: "monospace" }}>
        Index out of range: {i} (deck has {deck.content.cards.length} cards)
      </div>
    );
  }

  const style = CATEGORY_STYLES[deck.category];
  const categoryLabel = deck.labelOverride ?? style.label;
  const bandColor = deck.bandColorOverride ?? style.bandColor;
  const total = deck.content.cards.length;

  return (
    <div
      // Puppeteer가 이 요소를 정확히 1080×1350으로 캡처
      id="card-frame"
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        position: "relative",
        overflow: "hidden",
        margin: 0,
      }}
    >
      {i === 0 ? (
        <CardCover
          card={card}
          index={i}
          total={total}
          categoryLabel={categoryLabel}
          bandColor={bandColor}
          handle={handle}
          photoUrl={deck.photoUrl}
        />
      ) : (
        <CardContent
          card={card}
          index={i}
          total={total}
          categoryLabel={categoryLabel}
          bandColor={bandColor}
          handle={handle}
        />
      )}
    </div>
  );
}
