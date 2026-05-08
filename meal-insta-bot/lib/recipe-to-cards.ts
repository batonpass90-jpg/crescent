/**
 * 소요 앱 Recipe 1개 → 8장 카드뉴스 시퀀스로 변환.
 *
 * 시퀀스 구조:
 *   01 커버 (V5 — 사진 + 헤드라인)
 *   02 재료 (V4 — rows 라벨/값)
 *   03 조리 STEP (V4 — steps + 팁 콜아웃)
 *   04 체크 (V4 — 추천/비추천 rows)  ※ 휴리스틱 생성
 *   05 응용 (V4 — 변형 3종)            ※ 휴리스틱 생성
 *   06 영양 (V4 — kcal·매크로 추정)   ※ 추정값
 *   07 보관 (V4 — 보관/재가열)        ※ 카테고리별 템플릿
 *   08 CTA (V4 — 소요 앱 딥링크)
 */

import type { CardNewsContent } from "./content-types";
import type { Recipe } from "./recipe-source";
import { SoyoFeatures, SoyoLinks } from "./soyo-tokens";

export function recipeToCards(recipe: Recipe): CardNewsContent {
  const dayLabel = inferDayLabel(recipe);

  return {
    title: `${dayLabel} ${recipe.name}`,
    cards: [
      // 01 커버
      {
        headline: recipe.name,
        body: `${recipe.time}분 컷, ${recipe.difficulty}\n${recipe.kcal} kcal · ${recipe.category}`,
        image_concept: `${recipe.name}, top down, warm lighting`,
        subtitle: `오늘의 한 끼 · ${dayLabel}`,
      },

      // 02 재료
      {
        headline: "재료",
        subtitle: `${recipe.ingredients.length}가지 · 1인분`,
        body: "마트에서 한 봉지에 살 수 있는 것들로.",
        rows: ingredientsToRows(recipe.ingredients),
        image_concept: "ingredients flatlay",
      },

      // 03 조리 STEP
      {
        headline: "조리 STEP",
        subtitle: `총 ${recipe.time}분 · ${recipe.difficulty}`,
        body: "",
        steps: recipe.steps.map(stripTrailingPunct),
        callout: recipe.tip
          ? { tone: "tip", text: recipe.tip }
          : undefined,
        image_concept: `${recipe.name} cooking process`,
      },

      // 04 체크
      {
        headline: "체크",
        subtitle: "이런 분께 추천",
        body: "",
        rows: [
          {
            label: "추천",
            value: recommendReasons(recipe).join("\n"),
          },
          {
            label: "비추천",
            value: avoidReasons(recipe).join("\n"),
          },
        ],
        image_concept: "comparison",
      },

      // 05 응용
      {
        headline: "응용",
        subtitle: "한 레시피로 일주일",
        body: "응용 3가지로 일주일 버티기.",
        rows: variationRows(recipe),
        image_concept: "variations",
      },

      // 06 영양
      {
        headline: "영양",
        subtitle: "1인분 기준 · 약",
        body: "",
        rows: nutritionRows(recipe),
        callout: nutritionCallout(recipe),
        image_concept: "nutrition breakdown",
      },

      // 07 보관
      {
        headline: "남으면",
        subtitle: "보관 + 다시 먹기",
        body: "",
        rows: [
          { label: "냉장", value: "최대 2일" },
          { label: "냉동", value: "최대 2주 (1회분씩 소분)" },
          {
            label: "재가열",
            value: "전자레인지 1분 30초\n또는 팬에 30초 다시",
          },
          { label: "절대 X", value: "실온 4시간↑ — 식중독 위험" },
        ],
        callout: {
          tone: "tip",
          text: "처음부터 2인분 만들면 다음 끼니 3분 컷.\n자취 가성비 최강 루틴.",
        },
        image_concept: "storage",
      },

      // 08 CTA — 소요 앱 4가지 핵심 기능 (자취인 페인포인트 매핑)
      {
        headline: "혼자서도\n잘 먹기",
        subtitle: "자취인 식단앱 · 소요",
        body: "",
        rows: SoyoFeatures.map((f) => ({ label: f.name, value: f.pain })),
        callout: {
          tone: "tip",
          text: "소요 앱에서\n오늘 먹은 음식 업로드해보세요.",
        },
        image_concept: "soyo app feature CTA",
      },
    ],
    caption: buildCaption(recipe),
    hashtags: buildHashtags(recipe),
  };
}

// ── 휴리스틱 헬퍼 ─────────────────────────────────────────

function inferDayLabel(_recipe: Recipe): string {
  const days = ["월", "화", "수", "목", "금", "토", "일"];
  return days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
}

function stripTrailingPunct(s: string): string {
  return s.replace(/[.!]+$/, "");
}

function ingredientsToRows(ings: string[]): { label: string; value: string }[] {
  return ings.slice(0, 5).map((ing) => {
    // "파스타 면 100g" → label="파스타 면", value="100g"
    const m = ing.match(/^(.+?)\s+([\d/.]+\s*\S*|약간|한\s*줌)$/);
    if (m) return { label: m[1], value: m[2] };
    return { label: ing, value: "" };
  });
}

function recommendReasons(recipe: Recipe): string[] {
  const r: string[] = [];
  if (recipe.time <= 10) r.push("시간 없을 때");
  if (recipe.difficulty === "초간단") r.push("요리 처음");
  if (recipe.kcal < 400) r.push("가볍게 먹고 싶을 때");
  if (recipe.category === "한식") r.push("집밥 그리울 때");
  if (recipe.category === "양식") r.push("기분 전환 끼니");
  if (recipe.category === "샐러드") r.push("다이어트 중");
  return r.slice(0, 3);
}

function avoidReasons(recipe: Recipe): string[] {
  const r: string[] = [];
  if (recipe.kcal > 500) r.push("다이어트 강박 중");
  if (recipe.category === "한식" && /김치|매운/.test(recipe.name))
    r.push("위장 약한 날");
  if (recipe.ingredients.length > 6) r.push("재료 사기 귀찮을 때");
  if (r.length === 0) r.push("배 안 고플 때");
  return r.slice(0, 3);
}

function variationRows(recipe: Recipe): { label: string; value: string }[] {
  // 카테고리별 응용 템플릿
  if (recipe.category === "한식") {
    return [
      { label: "치즈 추가", value: "마지막에 슬라이스 치즈 1장" },
      { label: "참치 추가", value: "참치캔 반 통" },
      { label: "스팸 추가", value: "다이스로 썰어 먼저 볶기" },
    ];
  }
  if (recipe.category === "양식") {
    return [
      { label: "베이컨 추가", value: "잘게 썰어 같이 볶기" },
      { label: "치즈 토핑", value: "파마산 1큰술" },
      { label: "매콤하게", value: "페퍼론치노 한 꼬집" },
    ];
  }
  return [
    { label: "단백질 추가", value: "닭가슴살·두부 한 줌" },
    { label: "탄수화물 추가", value: "현미밥 반 공기" },
    { label: "드레싱 변경", value: "발사믹 / 요거트 / 간장" },
  ];
}

function nutritionRows(recipe: Recipe): { label: string; value: string }[] {
  // 카테고리/kcal 기반 매크로 추정
  const carbsRatio =
    recipe.category === "양식" ? 0.5 : recipe.category === "샐러드" ? 0.3 : 0.55;
  const proteinRatio = recipe.category === "샐러드" ? 0.3 : 0.18;
  const fatRatio = 1 - carbsRatio - proteinRatio;

  const carbs = Math.round((recipe.kcal * carbsRatio) / 4);
  const protein = Math.round((recipe.kcal * proteinRatio) / 4);
  const fat = Math.round((recipe.kcal * fatRatio) / 9);

  return [
    { label: "칼로리", value: `약 ${recipe.kcal} kcal` },
    { label: "탄수화물", value: `${carbs}g` },
    { label: "단백질", value: `${protein}g` },
    { label: "지방", value: `${fat}g` },
    { label: "조리시간", value: `${recipe.time}분` },
  ];
}

function nutritionCallout(recipe: Recipe) {
  if (recipe.kcal > 500) {
    return {
      tone: "warn" as const,
      text: "한 끼 비중 큼.\n다른 끼니는 가볍게 챙기기.",
    };
  }
  if (recipe.category === "샐러드") {
    return {
      tone: "tip" as const,
      text: "탄수 부족하면 현미밥 반 공기 추가.\n포만감 +30분.",
    };
  }
  return {
    tone: "tip" as const,
    text: "단백질 더 챙기려면 두부 반 모.\n+10g 단백질, +60kcal.",
  };
}

function buildCaption(recipe: Recipe): string {
  const ingredientList = recipe.ingredients.map((i) => `- ${i}`).join("\n");
  const stepList = recipe.steps
    .map((s, i) => `${i + 1}. ${stripTrailingPunct(s)}`)
    .join("\n");
  return `${recipe.name} — ${recipe.time}분 컷, ${recipe.difficulty}.

▷ 재료 (1인분)
${ingredientList}

▷ 만드는 법
${stepList}${recipe.tip ? `\n\n▷ 팁\n${recipe.tip}` : ""}

▷ 더 많은 레시피
${SoyoLinks.recipeDetailWeb(recipe.id)}`;
}

function buildHashtags(recipe: Recipe): string[] {
  const base = ["#자취식단", "#1인가구", "#자취요리", "#소요앱"];
  if (recipe.time <= 10) base.push("#10분요리");
  if (recipe.difficulty === "초간단") base.push("#초간단요리");
  if (recipe.category === "한식") base.push("#한식");
  if (recipe.category === "양식") base.push("#양식레시피");
  if (recipe.category === "샐러드") base.push("#다이어트식단");
  base.push(`#${recipe.name.replace(/\s+/g, "")}`);
  return base;
}
