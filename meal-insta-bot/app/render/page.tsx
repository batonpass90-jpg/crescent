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
  if (source.startsWith("sample:")) {
    const cat = source.slice("sample:".length) as ContentCategory;
    const content = SAMPLE_BY_CATEGORY[cat];
    if (!content) return null;
    // 샘플 카테고리별 사진은 preview 페이지의 PHOTO_BY_CATEGORY와 동일 매핑 필요.
    // 여기선 첫 카드의 image_concept 키워드를 photoFor 우회로 사용 — 단순화.
    // 실제로는 카테고리별 photoUrl을 별도 관리해야 함.
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
          categoryLabel={style.label}
          bandColor={style.bandColor}
          handle={handle}
          photoUrl={deck.photoUrl}
        />
      ) : (
        <CardContent
          card={card}
          index={i}
          total={total}
          categoryLabel={style.label}
          bandColor={style.bandColor}
          handle={handle}
        />
      )}
    </div>
  );
}
