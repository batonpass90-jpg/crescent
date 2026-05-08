import { SAMPLE_BY_CATEGORY } from "@/lib/sample-content";
import { CATEGORY_STYLES } from "@/lib/category-style";
import { CARD_WIDTH, CARD_HEIGHT } from "@/components/CardTemplate";
import { CardCover } from "@/components/CardCover";
import { CardContent } from "@/components/CardContent";
import { RECIPES, FOOD_PHOTOS, photoFor } from "@/lib/recipe-source";
import { recipeToCards } from "@/lib/recipe-to-cards";
import { SoyoLinks } from "@/lib/soyo-tokens";

const PREVIEW_SCALE = 0.32;
const COMPARE_SCALE = 0.28;

const HANDLE = SoyoLinks.instagramHandle;

/**
 * 카테고리 비교 섹션용 fallback 사진.
 * 실제 카드 표지는 음식 이름 → FOOD_PHOTOS 매핑이 우선.
 */
const PHOTO_BY_CATEGORY: Record<string, string> = {
  today_meal: FOOD_PHOTOS["김치볶음밥"], // 샘플 데크가 김치볶음밥
  weekly_menu:
    "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1080&h=1350&fit=crop",
  diet_info:
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1080&h=1350&fit=crop",
};

interface CardFrameProps {
  scale: number;
  children: React.ReactNode;
}

function CardFrame({ scale, children }: CardFrameProps) {
  return (
    <div
      className="border border-neutral-300 shadow-md overflow-hidden"
      style={{
        width: CARD_WIDTH * scale,
        height: CARD_HEIGHT * scale,
      }}
    >
      <div
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function PreviewPage() {
  const today = SAMPLE_BY_CATEGORY.today_meal;
  const todayStyle = CATEGORY_STYLES.today_meal;

  return (
    <main className="min-h-screen bg-neutral-100 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          V4 + V5 하이브리드 시안
        </h1>
        <p className="text-neutral-600 mb-12">
          커버 1장 = V5 (사진 + 잡지 헤드라인) · 본문 7장 = V4 (페이퍼 + 정보 박스 + CTA).
          1080×1350 원본을 {Math.round(PREVIEW_SCALE * 100)}%로 축소.
        </p>

        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6">오늘의 한 끼 — 8장 시퀀스 (커버 → 정보 6장 → CTA)</h2>
          <div className="flex flex-wrap gap-6 items-start">
            {today.cards.map((card, i) => (
              <div key={i} className="shrink-0">
                <CardFrame scale={PREVIEW_SCALE}>
                  {i === 0 ? (
                    <CardCover
                      card={card}
                      index={i}
                      total={today.cards.length}
                      categoryLabel={todayStyle.label}
                      bandColor={todayStyle.bandColor}
                      handle={HANDLE}
                      photoUrl={PHOTO_BY_CATEGORY.today_meal}
                    />
                  ) : (
                    <CardContent
                      card={card}
                      index={i}
                      total={today.cards.length}
                      categoryLabel={todayStyle.label}
                      bandColor={todayStyle.bandColor}
                      handle={HANDLE}
                    />
                  )}
                </CardFrame>
                <div className="mt-2 text-xs text-neutral-500 text-center">
                  카드 {i + 1}{i === 0 ? " (V5 커버)" : " (V4 본문)"}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-xl font-bold mb-3">
            카테고리별 커버 비교 (V5)
          </h2>
          <p className="text-sm text-neutral-500 mb-5">
            카테고리마다 사진 + 강조색이 다름. 사진은 Unsplash 임의 샘플 (실제로는 Claude의 image_concept를 검색어로 사용해 자동 매칭)
          </p>
          <div className="flex flex-wrap gap-6 items-start">
            {(Object.keys(SAMPLE_BY_CATEGORY) as Array<keyof typeof SAMPLE_BY_CATEGORY>).map(
              (cat) => {
                const sample = SAMPLE_BY_CATEGORY[cat];
                const style = CATEGORY_STYLES[cat];
                return (
                  <div key={cat} className="shrink-0">
                    <CardFrame scale={COMPARE_SCALE}>
                      <CardCover
                        card={sample.cards[0]}
                        index={0}
                        total={5}
                        categoryLabel={style.label}
                        bandColor={style.bandColor}
                        handle={HANDLE}
                        photoUrl={PHOTO_BY_CATEGORY[cat]}
                      />
                    </CardFrame>
                    <div className="mt-2 text-xs text-neutral-500 text-center">
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                        style={{ backgroundColor: style.bandColor }}
                      />
                      {style.label}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-xl font-bold mb-3">
            본문 카드 응용 (V4 — 풍부한 정보)
          </h2>
          <p className="text-sm text-neutral-500 mb-5">
            STEP 카드 (단계 박스), 재료 카드 (라벨-값 표), 비교 카드 (추천/비추천), 결론 카드 (callout) 패턴
          </p>
          <div className="flex flex-wrap gap-6 items-start">
            {today.cards.slice(1).map((card, i) => {
              const idx = i + 1;
              return (
                <div key={idx} className="shrink-0">
                  <CardFrame scale={PREVIEW_SCALE}>
                    <CardContent
                      card={card}
                      index={idx}
                      total={today.cards.length}
                      categoryLabel={todayStyle.label}
                      bandColor={todayStyle.bandColor}
                      handle={HANDLE}
                    />
                  </CardFrame>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-xl font-bold mb-3">
            소요 앱 레시피 → 카드뉴스 자동 생성
          </h2>
          <p className="text-sm text-neutral-500 mb-5">
            소요 앱{" "}
            <code className="px-1 py-0.5 bg-neutral-200 rounded text-xs">
              RECIPES[0]
            </code>{" "}
            ({RECIPES[0].name})를 recipeToCards()로 8장 시퀀스 자동 생성. CTA에
            앱 딥링크 포함.
          </p>
          <div className="flex flex-wrap gap-6 items-start">
            {(() => {
              const recipe = RECIPES[0];
              const generated = recipeToCards(recipe);
              const style = CATEGORY_STYLES.today_meal;
              const photoUrl = photoFor(recipe);
              return generated.cards.map((card, i) => (
                <div key={i} className="shrink-0">
                  <CardFrame scale={PREVIEW_SCALE}>
                    {i === 0 ? (
                      <CardCover
                        card={card}
                        index={i}
                        total={generated.cards.length}
                        categoryLabel={style.label}
                        bandColor={style.bandColor}
                        handle={HANDLE}
                        photoUrl={photoUrl}
                      />
                    ) : (
                      <CardContent
                        card={card}
                        index={i}
                        total={generated.cards.length}
                        categoryLabel={style.label}
                        bandColor={style.bandColor}
                        handle={HANDLE}
                      />
                    )}
                  </CardFrame>
                  <div className="mt-2 text-xs text-neutral-500 text-center">
                    {String(i + 1).padStart(2, "0")} ·{" "}
                    {(card.headline || "").split("\n")[0]}
                  </div>
                </div>
              ));
            })()}
          </div>
        </section>

        <div className="p-6 bg-neutral-900 text-neutral-100 rounded-lg max-w-3xl text-sm">
          <div className="font-semibold mb-2">소요 앱 동기화 완료</div>
          <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
            <li>
              컬러 토큰: 소요 Colors.ts → lib/soyo-tokens.ts (paper2·ink·clay·sage·sky)
            </li>
            <li>
              폰트: NotoSerifKR(헤드라인) + NotoSansKR(본문) — 소요 앱과 동일
            </li>
            <li>
              데이터: 소요 RECIPES → lib/recipe-source.ts (운영 시 API fetch로 교체)
            </li>
            <li>
              자동 생성: lib/recipe-to-cards.ts — Recipe 1개 → 8장 시퀀스
            </li>
            <li>
              CTA: SoyoLinks.recipeDetailWeb(id) 딥링크 + {HANDLE}
            </li>
            <li className="text-amber-300">
              TODO: 인스타 핸들·앱 도메인 실제 값으로 교체 (lib/soyo-tokens.ts)
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
