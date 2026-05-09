/**
 * 주간 식단표 → 8장 카드뉴스 시퀀스.
 *
 * 시퀀스:
 *   01 커버
 *   02 평일 메뉴 (월·화·수)
 *   03 평일 메뉴 (목·금)
 *   04 주말 메뉴 (토·일)
 *   05 장보기 리스트 (1)
 *   06 장보기 리스트 (2) + 예산
 *   07 보관·재가열 팁
 *   08 CTA (소요 앱)
 */

import type { CardNewsContent } from "./content-types";
import type { WeeklyMenu } from "./weekly-menus";
import { SoyoFeatures } from "./soyo-tokens";

export function weeklyMenuToCards(menu: WeeklyMenu): CardNewsContent {
  const seriesNo = String(parseInt(menu.id, 10) || 1).padStart(2, "0");
  const seriesLabel = `자취 일주일 식단표 #${seriesNo}`;

  // 장보기 리스트 분할 (한 카드당 최대 4행)
  const shopping1 = menu.shopping.slice(0, 4);
  const shopping2 = menu.shopping.slice(4);

  return {
    title: `${seriesLabel} — ${menu.theme}`,
    cards: [
      // 01 커버
      {
        headline: menu.theme,
        body: menu.description,
        image_concept: menu.photoQuery,
        subtitle: seriesLabel,
      },

      // 02 평일 메뉴 — 강한 후크 (이번 주 핵심)
      {
        headline: "이번 주\n뭐 먹지?",
        subtitle: `한 끼 ${estimatePerMeal(menu.budget)} 컷`,
        body: "월·화·수 메뉴 — 미리 정해두면 고민 끝.",
        rows: menu.weekdays.slice(0, 3).map((m) => ({
          label: m.day,
          value: m.meal,
        })),
        image_concept: "weekday meals",
      },

      // 03 평일 (목·금)
      {
        headline: "목·금",
        subtitle: "주중 식단",
        body: "",
        rows: menu.weekdays.slice(3).map((m) => ({
          label: m.day,
          value: m.meal,
        })),
        image_concept: "thursday friday meals",
      },

      // 04 주말 (토·일)
      {
        headline: "주말",
        subtitle: "토·일",
        body: "",
        rows: menu.weekend.map((m) => ({ label: m.day, value: m.meal })),
        callout: menu.weekendNote
          ? { tone: "tip", text: menu.weekendNote }
          : undefined,
        image_concept: "weekend meals",
      },

      // 05 장보기 (1)
      {
        headline: "장보기",
        subtitle: "주 1회 마트",
        body: "",
        rows: shopping1.map((s) => ({ label: s.item, value: s.price })),
        image_concept: "shopping list 1",
      },

      // 06 장보기 (2) + 예산
      {
        headline: "예산",
        subtitle: menu.budget,
        body: "",
        rows:
          shopping2.length > 0
            ? shopping2.map((s) => ({ label: s.item, value: s.price }))
            : [{ label: "총합", value: menu.budget }],
        callout: {
          tone: "tip",
          text: `한 끼 약 ${estimatePerMeal(menu.budget)} — 외식보다 절반 이하.`,
        },
        image_concept: "budget breakdown",
      },

      // 07 저장 유도 — 보관 + 명시적 저장 CTA
      {
        headline: "다음 주말\n장보기",
        subtitle: "저장하면 30분 단축",
        body: "",
        callout: {
          tone: "tip",
          text: "오른쪽 ⇲ 저장 — 마트 갈 때 다시 꺼내보세요.",
        },
        rows: [
          { label: "냉장", value: "단백질 3일 / 채소 5일" },
          { label: "냉동", value: "고기·만두 2주 (1회분 소분)" },
          { label: "팁", value: menu.storageTip.split(".")[0] },
          { label: "주의", value: "실온 4시간↑ 절대 X" },
        ],
        image_concept: "save weekly menu",
      },

      // 08 CTA — 소요 앱 + 명시적 행동 지침
      {
        headline: "혼자서도\n잘 먹기",
        subtitle: "자취인 식단앱 · 소요",
        body: "",
        rows: SoyoFeatures.map((f) => ({ label: f.name, value: f.pain })),
        callout: {
          tone: "tip",
          text: "저장 — 다음 주 장보기 때 다시\n친구 태그 — 같이 자취 시작\n팔로우 — 매일 11:30 · 18:00",
        },
        image_concept: "soyo app feature CTA",
      },
    ],
    caption: buildMenuCaption(menu),
    hashtags: buildMenuHashtags(menu),
  };
}

function estimatePerMeal(budget: string): string {
  // "약 2만 8천원" → "약 4,000원" (7끼 기준 거칠게)
  const match = budget.match(/(\d+).*?(\d+)?/);
  if (!match) return "5,000원";
  const total = parseInt(match[1], 10) * 10000 + (parseInt(match[2] ?? "0", 10) * 1000);
  const perMeal = Math.round(total / 7 / 100) * 100;
  return `${perMeal.toLocaleString()}원`;
}

function buildMenuCaption(menu: WeeklyMenu): string {
  const weekdayList = menu.weekdays.map((m) => `${m.day}: ${m.meal}`).join("\n");
  const weekendList = menu.weekend.map((m) => `${m.day}: ${m.meal}`).join("\n");
  const shoppingList = menu.shopping
    .map((s) => `- ${s.item}: ${s.price}`)
    .join("\n");

  return `${menu.theme} — ${menu.description}

▷ 평일
${weekdayList}

▷ 주말
${weekendList}

▷ 장보기 (${menu.budget})
${shoppingList}

▷ 보관 팁
${menu.storageTip}

▷ 더 많은 식단 → @soyo.recipe`;
}

function buildMenuHashtags(menu: WeeklyMenu): string[] {
  const base = [
    "#자취식단",
    "#일주일식단",
    "#1인가구",
    "#자취요리",
    "#소요앱",
    "#식단표",
  ];
  if (menu.theme.includes("다이어트") || menu.theme.includes("저칼로리"))
    base.push("#다이어트식단");
  if (menu.theme.includes("단백질")) base.push("#고단백식단");
  if (menu.theme.includes("예산") || menu.theme.includes("절약"))
    base.push("#가성비식단");
  if (menu.theme.includes("야근")) base.push("#야근식단");
  if (menu.theme.includes("한식")) base.push("#한식");
  base.push(`#${menu.theme.replace(/\s+/g, "")}`);
  return base;
}
