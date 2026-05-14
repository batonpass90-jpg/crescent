/**
 * ChallengePost → 8장 카드뉴스.
 * 시퀀스: 표지 / 문제 / 결과 미리보기 / 규칙(2분할) / 결과 상세 / 참여유도 / CTA
 */

import type { CardNewsContent } from "./content-types";
import type { ChallengePost } from "./challenge-posts";
import { SoyoFeatures } from "./soyo-tokens";

export function challengeToCards(post: ChallengePost): CardNewsContent {
  const rulesHalf1 = post.rules.slice(0, Math.ceil(post.rules.length / 2));
  const rulesHalf2 = post.rules.slice(Math.ceil(post.rules.length / 2));

  return {
    title: `${post.hookSubtitle} — ${post.topic.replace(/\n/g, " ")}`,
    cards: [
      // 01 커버 — 강한 약속
      {
        headline: post.topic,
        body: post.hookBody,
        image_concept: "challenge cover",
        subtitle: post.hookSubtitle,
      },

      // 02 문제 (왜 도전하나)
      {
        headline: "이렇게\n살래?",
        subtitle: post.problem.title,
        body: "하나라도 해당되면 → 30일만 도전.",
        rows: post.problem.rows,
        image_concept: "problem statement",
      },

      // 03 결과 미리보기 (성공한 사람의 30일 후)
      {
        headline: "30일 후\n이렇게",
        subtitle: "실험 결과 (미리보기)",
        body: "",
        rows: post.results.map((r) => ({
          label: r.metric,
          value: `${r.before} → ${r.after}`,
        })),
        image_concept: "results preview",
      },

      // 04 규칙 전반
      {
        headline: "1주차\n2주차",
        subtitle: "초반 규칙",
        body: "",
        rows: rulesHalf1.map((r) => ({
          label: r.day,
          value: `${r.rule}\n(${r.why})`,
        })),
        image_concept: "rules first half",
      },

      // 05 규칙 후반
      {
        headline: "3주차\n4주차",
        subtitle: "후반 규칙",
        body: "",
        rows: rulesHalf2.map((r) => ({
          label: r.day,
          value: `${r.rule}\n(${r.why})`,
        })),
        image_concept: "rules second half",
      },

      // 06 결과 상세
      {
        headline: "실제\n변화",
        subtitle: "Before → After",
        body: "",
        rows: post.results.map((r) => ({
          label: r.metric,
          value: `${r.before}\n→ ${r.after}`,
        })),
        callout: {
          tone: "tip",
          text: "이 결과는 평균치 — 개인차 있음.",
        },
        image_concept: "transformation results",
      },

      // 07 참여 유도 (저장 + 인증)
      {
        headline: "도전\n시작",
        subtitle: "오늘부터 Day 1",
        body: "",
        rows: [
          { label: "1. 저장", value: "30일간 규칙 확인" },
          { label: "2. 인증", value: post.joinHook },
          { label: "3. 친구 태그", value: "같이 도전 — 성공률 ↑" },
        ],
        callout: {
          tone: "tip",
          text: "혼자보다 같이 → 30일 완주율 3배.",
        },
        image_concept: "join action",
      },

      // 08 CTA — 소요 앱
      {
        headline: "혼자서도\n잘 먹기",
        subtitle: "자취인 식단앱 · 소요",
        body: "",
        rows: SoyoFeatures.map((f) => ({ label: f.name, value: f.pain })),
        callout: {
          tone: "tip",
          text: "저장 — 30일 다시 보기\n친구 태그 — 같이 도전\n팔로우 — 매일 11:30 · 18:00",
        },
        image_concept: "soyo cta",
      },
    ],
    caption: buildCaption(post),
    hashtags: buildHashtags(post),
  };
}

function buildCaption(post: ChallengePost): string {
  const rulesList = post.rules
    .map((r) => `· ${r.day}: ${r.rule}`)
    .join("\n");
  const resultsList = post.results
    .map((r) => `· ${r.metric}: ${r.before} → ${r.after}`)
    .join("\n");
  return `${post.topic.replace(/\n/g, " ")}

${post.hookBody}

▷ 규칙
${rulesList}

▷ 결과
${resultsList}

▷ ${post.joinHook}

▷ 더 많은 자취 챌린지 → @soyo.recipe`;
}

function buildHashtags(post: ChallengePost): string[] {
  const base = [
    "#자취챌린지",
    "#30일챌린지",
    "#자취일상",
    "#1인가구",
    "#자취식단",
    "#소요앱",
  ];
  const topic = post.topic.replace(/\n/g, "").replace(/\s+/g, "");
  if (topic.includes("라면")) base.push("#라면끊기");
  if (topic.includes("식비")) base.push("#식비절약", "#가성비자취");
  if (topic.includes("야식")) base.push("#야식끊기");
  if (topic.includes("도시락")) base.push("#도시락챌린지");
  if (topic.includes("단백질")) base.push("#고단백식단");
  if (topic.includes("냉장고")) base.push("#냉장고파먹기");
  if (topic.includes("청소")) base.push("#자취청소");
  base.push(`#${topic}`);
  return base;
}
