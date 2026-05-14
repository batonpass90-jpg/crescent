/**
 * ComparePost → 8장 카드뉴스.
 * 시퀀스: 표지 / 실험 조건 / A상세 / B상세 / 차이 / 결론 / 참여 / CTA
 */

import type { CardNewsContent } from "./content-types";
import type { ComparePost } from "./compare-posts";
import { SoyoFeatures } from "./soyo-tokens";

export function compareToCards(post: ComparePost): CardNewsContent {
  return {
    title: `${post.hookSubtitle} — ${post.topic.replace(/\n/g, " ")}`,
    cards: [
      // 01 커버
      {
        headline: post.topic,
        body: post.hookBody,
        image_concept: "comparison cover",
        subtitle: post.hookSubtitle,
      },

      // 02 실험 조건 (객관성 확보)
      {
        headline: "실험\n조건",
        subtitle: "공정 비교 위해",
        body: post.setup,
        rows: [
          { label: "A", value: post.itemA.label },
          { label: "B", value: post.itemB.label },
          { label: "기간", value: "동일 / 변수 통제" },
        ],
        image_concept: "experiment setup",
      },

      // 03 A 상세
      {
        headline: post.itemA.label,
        subtitle: post.itemA.summary,
        body: "",
        rows: post.itemA.rows,
        image_concept: "option A details",
      },

      // 04 B 상세
      {
        headline: post.itemB.label,
        subtitle: post.itemB.summary,
        body: "",
        rows: post.itemB.rows,
        image_concept: "option B details",
      },

      // 05 차이 (핵심)
      {
        headline: post.diffTitle,
        subtitle: "객관적 수치",
        body: "",
        rows: post.diffRows,
        callout: {
          tone: "tip",
          text: "숫자는 거짓말 안 한다.",
        },
        image_concept: "difference numbers",
      },

      // 06 결론
      {
        headline: "결론",
        subtitle: "한 줄로",
        body: "",
        callout: {
          tone: "tip",
          text: post.conclusion,
        },
        rows: [
          {
            label: "행동",
            value: "오늘 한 끼부터 바꿔보기.",
          },
        ],
        image_concept: "conclusion",
      },

      // 07 참여
      {
        headline: "공유\n포인트",
        subtitle: "댓글·태그 유도",
        body: "",
        rows: [
          { label: "댓글", value: post.shareHook },
          { label: "저장", value: "다음 결정할 때 다시 보기" },
          { label: "공유", value: "친구한테 충격 주기" },
        ],
        image_concept: "share action",
      },

      // 08 CTA
      {
        headline: "혼자서도\n잘 먹기",
        subtitle: "자취인 식단앱 · 소요",
        body: "",
        rows: SoyoFeatures.map((f) => ({ label: f.name, value: f.pain })),
        callout: {
          tone: "tip",
          text: "저장 — 결정할 때\n친구 태그 — 충격 공유\n팔로우 — 매일 11:30 · 18:00",
        },
        image_concept: "soyo cta",
      },
    ],
    caption: buildCaption(post),
    hashtags: buildHashtags(post),
  };
}

function buildCaption(post: ComparePost): string {
  const aRows = post.itemA.rows
    .map((r) => `· ${r.label}: ${r.value}`)
    .join("\n");
  const bRows = post.itemB.rows
    .map((r) => `· ${r.label}: ${r.value}`)
    .join("\n");
  const diffRows = post.diffRows
    .map((r) => `· ${r.label}: ${r.value}`)
    .join("\n");
  return `${post.topic.replace(/\n/g, " ")}

${post.hookBody}

▷ ${post.itemA.label}
${aRows}

▷ ${post.itemB.label}
${bRows}

▷ ${post.diffTitle}
${diffRows}

▷ ${post.conclusion}

▷ ${post.shareHook}

▷ @soyo.recipe`;
}

function buildHashtags(post: ComparePost): string[] {
  const base = [
    "#자취비교",
    "#자취실험",
    "#자취일상",
    "#1인가구",
    "#자취팁",
    "#소요앱",
  ];
  const topic = post.topic.replace(/\n/g, "").replace(/\s+/g, "");
  if (topic.includes("라면")) base.push("#라면", "#식단비교");
  if (topic.includes("외식")) base.push("#외식vs집밥");
  if (topic.includes("쿠팡")) base.push("#장보기비교");
  if (topic.includes("도시락")) base.push("#도시락");
  if (topic.includes("MBTI") || topic.includes("성별")) base.push("#자취유형");
  base.push(`#${topic}`);
  return base;
}
