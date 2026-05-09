/**
 * 식단 정보 → 8장 카드뉴스 시퀀스.
 *
 * 시퀀스:
 *   01 커버 (페인 후크 + 약속)
 *   02 기준·수치
 *   03 식재료별 정보
 *   04 자취 적용 (추천/주의)
 *   05 흔한 실수 (callout 강조)
 *   06 응용·실천 팁
 *   07 한 줄 결론
 *   08 CTA (소요 앱)
 */

import type { CardNewsContent } from "./content-types";
import type { DietInfo } from "./diet-infos";
import { SoyoFeatures } from "./soyo-tokens";

export function dietInfoToCards(info: DietInfo): CardNewsContent {
  const seriesNo = String(parseInt(info.id, 10) || 1).padStart(2, "0");
  const seriesLabel = info.hookSubtitle;

  return {
    title: `${seriesLabel} — ${info.topic.replace(/\n/g, " ")}`,
    cards: [
      // 01 커버
      {
        headline: info.topic,
        body: info.hookBody,
        image_concept: info.photoQuery,
        subtitle: seriesLabel,
      },

      // 02 기준·수치 — 강한 후크 (당신은 안전한가?)
      {
        headline: "당신은\n어떤가?",
        subtitle: info.criteria.title,
        body: "지금 본인 수치 — 표 보고 빠르게 체크.",
        rows: info.criteria.rows,
        image_concept: "self check chart",
      },

      // 03 식재료별 정보
      {
        headline: info.sources.title,
        subtitle: "흔한 식재료 기준",
        body: "",
        rows: info.sources.rows,
        image_concept: "food sources table",
      },

      // 04 자취 적용
      {
        headline: info.application.title,
        subtitle: "5년차의 추천",
        body: "",
        rows: info.application.rows,
        image_concept: "practical application",
      },

      // 05 흔한 실수 (강조)
      {
        headline: "흔한 실수",
        subtitle: "5년차도 한 번씩",
        body: "",
        callout: {
          tone: "warn",
          text: info.mistakeCallout,
        },
        rows: [
          {
            label: "체크",
            value: "지금 본인은 어떤가?\n주 1회 점검 추천.",
          },
        ],
        image_concept: "common mistake warning",
      },

      // 06 핵심 정리 (3 takeaways)
      {
        headline: "핵심 3가지",
        subtitle: "기억할 것",
        body: "",
        rows: extractKeyPoints(info),
        image_concept: "key points",
      },

      // 07 저장 유도 — 결론 + 명시적 저장 CTA
      {
        headline: "한 줄\n결론",
        subtitle: "저장하면 평생 기억",
        body: "",
        callout: {
          tone: "tip",
          text: info.conclusion,
        },
        rows: [
          {
            label: "다시 보기",
            value: "오른쪽 ⇲ 저장\n다음 마트 갈 때 다시 꺼내기",
          },
          {
            label: "공유",
            value: "친구가 자취 중이면\n태그해서 같이 보기",
          },
        ],
        image_concept: "save conclusion",
      },

      // 08 CTA — 소요 앱 + 명시적 행동 지침
      {
        headline: "혼자서도\n잘 먹기",
        subtitle: "자취인 식단앱 · 소요",
        body: "",
        rows: SoyoFeatures.map((f) => ({ label: f.name, value: f.pain })),
        callout: {
          tone: "tip",
          text: "저장 — 다시 꺼내볼 때\n친구 태그 — 같이 시작\n팔로우 — 매일 11:30 · 18:00",
        },
        image_concept: "soyo app feature CTA",
      },
    ],
    caption: buildInfoCaption(info),
    hashtags: buildInfoHashtags(info),
  };
}

/**
 * 식단정보에서 핵심 3가지 추출 — application + conclusion에서.
 */
function extractKeyPoints(info: DietInfo): { label: string; value: string }[] {
  return [
    { label: "기준", value: info.criteria.rows[0]?.value ?? "—" },
    {
      label: "추천",
      value:
        info.application.rows.find((r) => r.label === "추천")?.value.split(
          "\n",
        )[0] ?? info.application.rows[0]?.value ?? "—",
    },
    {
      label: "결론",
      value: info.conclusion.split("\n")[0],
    },
  ];
}

function buildInfoCaption(info: DietInfo): string {
  const criteriaList = info.criteria.rows
    .map((r) => `- ${r.label}: ${r.value}`)
    .join("\n");
  return `${info.topic.replace(/\n/g, " ")}

${info.hookBody}

▷ ${info.criteria.title}
${criteriaList}

▷ 흔한 실수
${info.mistakeCallout}

▷ 결론
${info.conclusion}

▷ 더 많은 자취 정보 → @soyo.recipe`;
}

function buildInfoHashtags(info: DietInfo): string[] {
  const base = [
    "#자취식단",
    "#영양정보",
    "#1인가구",
    "#자취건강",
    "#소요앱",
  ];
  const topic = info.topic.replace(/\n/g, "").replace(/\s+/g, "");
  if (topic.includes("단백질")) base.push("#단백질", "#근손실예방");
  if (topic.includes("다이어트") || topic.includes("칼로리"))
    base.push("#다이어트", "#감량");
  if (topic.includes("식비") || topic.includes("절약"))
    base.push("#식비절약", "#가성비");
  if (topic.includes("라면")) base.push("#라면", "#자취음식");
  if (topic.includes("야식")) base.push("#야식", "#건강식습관");
  if (topic.includes("외식") || topic.includes("집밥"))
    base.push("#집밥", "#외식");
  base.push(`#${topic}`);
  return base;
}
