/**
 * TruthPost → 8장 카드뉴스.
 * 시퀀스: 표지 / 배경 / 진실 1·2 / 3·4 / 5 / 대응 / 저장유도 / CTA
 */

import type { CardNewsContent } from "./content-types";
import type { TruthPost } from "./truth-posts";
import { SoyoFeatures } from "./soyo-tokens";

export function truthToCards(post: TruthPost): CardNewsContent {
  const f1 = post.facts[0];
  const f2 = post.facts[1];
  const f3 = post.facts[2];
  const f4 = post.facts[3];
  const f5 = post.facts[4];

  return {
    title: `${post.hookSubtitle} — ${post.topic.replace(/\n/g, " ")}`,
    cards: [
      // 01 커버 — 호기심 폭발
      {
        headline: post.topic,
        body: post.hookBody,
        image_concept: "truth cover",
        subtitle: post.hookSubtitle,
      },

      // 02 배경 (왜 알아야 하나)
      {
        headline: "잠깐\n알고 가자",
        subtitle: post.setup.title,
        body: "내가 매일 쓰는 거 — 진실 알면 통장 살림.",
        rows: post.setup.rows,
        image_concept: "background context",
      },

      // 03 진실 1·2
      {
        headline: "진실\n1·2",
        subtitle: "첫 충격",
        body: "",
        rows: [
          { label: f1.fact.split(".")[0], value: f1.evidence },
          { label: f2.fact.split(".")[0], value: f2.evidence },
        ],
        image_concept: "facts 1 2",
      },

      // 04 진실 3·4
      {
        headline: "진실\n3·4",
        subtitle: "더 충격",
        body: "",
        rows: [
          { label: f3.fact.split(".")[0], value: f3.evidence },
          { label: f4.fact.split(".")[0], value: f4.evidence },
        ],
        image_concept: "facts 3 4",
      },

      // 05 진실 5
      {
        headline: "진실 5",
        subtitle: "마지막",
        body: f5.fact,
        callout: {
          tone: "warn",
          text: f5.evidence,
        },
        rows: [
          {
            label: "체크",
            value: "지금까지 모르고 살았다면?",
          },
        ],
        image_concept: "final fact",
      },

      // 06 대응 방법
      {
        headline: post.action.title,
        subtitle: "현명하게 사는 법",
        body: "",
        rows: post.action.rows,
        image_concept: "smart action",
      },

      // 07 저장 유도
      {
        headline: "다시\n또 보기",
        subtitle: "저장 명시",
        body: "",
        rows: [
          { label: "저장", value: post.saveHook },
          { label: "공유", value: "충격 받은 거 친구한테" },
          { label: "댓글", value: "본인 경험·반응 남기기" },
        ],
        callout: {
          tone: "tip",
          text: post.conclusion,
        },
        image_concept: "save action",
      },

      // 08 CTA
      {
        headline: "혼자서도\n잘 먹기",
        subtitle: "자취인 식단앱 · 소요",
        body: "",
        rows: SoyoFeatures.map((f) => ({ label: f.name, value: f.pain })),
        callout: {
          tone: "tip",
          text: "저장 — 다시 꺼낼 때\n친구 태그 — 같이 알기\n팔로우 — 매일 11:30 · 18:00",
        },
        image_concept: "soyo cta",
      },
    ],
    caption: buildCaption(post),
    hashtags: buildHashtags(post),
  };
}

function buildCaption(post: TruthPost): string {
  const factsList = post.facts
    .map((f, i) => `${i + 1}. ${f.fact} — ${f.evidence}`)
    .join("\n");
  const actionList = post.action.rows
    .map((a) => `· ${a.label}: ${a.value}`)
    .join("\n");
  return `${post.topic.replace(/\n/g, " ")}

${post.hookBody}

▷ 5가지 진실
${factsList}

▷ ${post.action.title}
${actionList}

▷ ${post.conclusion}

▷ ${post.saveHook}

▷ @soyo.recipe`;
}

function buildHashtags(post: TruthPost): string[] {
  const base = [
    "#자취진실",
    "#자취팁",
    "#1인가구",
    "#자취일상",
    "#소요앱",
    "#알면이득",
  ];
  const topic = post.topic.replace(/\n/g, "").replace(/\s+/g, "");
  if (topic.includes("편의점")) base.push("#편의점도시락");
  if (topic.includes("유튜브")) base.push("#자취유튜브");
  if (topic.includes("마트")) base.push("#장보기팁");
  if (topic.includes("한식")) base.push("#한식꿀팁");
  if (topic.includes("배달")) base.push("#배달앱");
  if (topic.includes("다이어트")) base.push("#다이어트");
  if (topic.includes("전기")) base.push("#전기절약");
  if (topic.includes("주말")) base.push("#자취주말");
  base.push(`#${topic}`);
  return base;
}
