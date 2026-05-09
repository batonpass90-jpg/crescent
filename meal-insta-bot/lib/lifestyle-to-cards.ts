/**
 * LifestylePost → 8장 카드뉴스 시퀀스.
 *
 * 시퀀스 (공유 유도형):
 *   01 커버 (강한 진단형 후크 — "너는 어떤 자취러?")
 *   02 5가지 유형 한눈에 (intro 표)
 *   03 유형 1-2 상세
 *   04 유형 3 상세
 *   05 유형 4 상세
 *   06 유형 5 상세 (있으면) 또는 유형 4-5 합본
 *   07 한 줄 정리 + 친구 태그 후크
 *   08 CTA (소요 앱)
 */

import type { CardNewsContent } from "./content-types";
import type { LifestylePost, LifestyleType } from "./lifestyle-posts";
import { SoyoFeatures } from "./soyo-tokens";

export function lifestyleToCards(post: LifestylePost): CardNewsContent {
  const types = post.types;
  const t1 = types[0];
  const t2 = types[1];
  const t3 = types[2];
  const t4 = types[3];
  const t5 = types[4];

  return {
    title: `${post.hookSubtitle} — ${post.topic.replace(/\n/g, " ")}`,
    cards: [
      // 01 커버 — 진단형 강한 후크
      {
        headline: post.topic,
        body: post.hookBody,
        image_concept: post.photoQuery,
        subtitle: post.hookSubtitle,
      },

      // 02 5가지 유형 한눈에
      {
        headline: post.intro.title,
        subtitle: "한눈에 보기",
        body: "본인 유형 미리 찍어보세요.",
        rows: post.intro.rows,
        image_concept: "lifestyle types overview",
      },

      // 03 유형 1
      typeCard(t1),

      // 04 유형 2 + 3 합본 (있으면 둘 다, 없으면 하나만)
      twoTypesCard(t2, t3),

      // 05 유형 4
      t4 ? typeCard(t4) : placeholderCard(),

      // 06 유형 5 (있으면)
      t5 ? typeCard(t5) : extraTipCard(post),

      // 07 친구 태그 유도 (공유 핵심 카드)
      {
        headline: "공유\n포인트",
        subtitle: "댓글·태그 유도",
        body: post.conclusion,
        rows: [
          { label: "공유", value: post.shareHook },
          { label: "댓글", value: "본인 유형 + 친구 태그" },
          { label: "저장", value: "다음에 친구한테 보여주기" },
        ],
        image_concept: "share with friend",
      },

      // 08 CTA — 소요 앱
      {
        headline: "혼자서도\n잘 먹기",
        subtitle: "자취인 식단앱 · 소요",
        body: "",
        rows: SoyoFeatures.map((f) => ({ label: f.name, value: f.pain })),
        callout: {
          tone: "tip",
          text: "저장 — 친구한테 보여주기\n친구 태그 — 같이 자취\n팔로우 — 매일 11:30 · 18:00",
        },
        image_concept: "soyo app feature CTA",
      },
    ],
    caption: buildLifestyleCaption(post),
    hashtags: buildLifestyleHashtags(post),
  };
}

function typeCard(t: LifestyleType) {
  return {
    headline: t.name,
    subtitle: t.trait,
    body: "",
    rows: [
      { label: "특징", value: t.habit },
      { label: "처방", value: t.prescription },
    ],
    image_concept: "type detail",
  };
}

function twoTypesCard(a: LifestyleType, b: LifestyleType | undefined) {
  if (!b) return typeCard(a);
  return {
    headline: "다른 유형도",
    subtitle: `${a.name} · ${b.name}`,
    body: "",
    rows: [
      { label: a.name.split(" ")[0], value: a.habit.split(",")[0] },
      { label: b.name.split(" ")[0], value: b.habit.split(",")[0] },
    ],
    image_concept: "two types compare",
  };
}

function placeholderCard() {
  return {
    headline: "공통점",
    subtitle: "유형 무관",
    body: "어떤 유형이든 다음 한 끼 자취가 시작.",
    image_concept: "common ground",
  };
}

function extraTipCard(post: LifestylePost) {
  return {
    headline: "보너스\n팁",
    subtitle: "유형 결정 못 하겠다면",
    body: "지난 일주일 식습관 떠올려 가장 많이 한 패턴이 본인 유형.",
    image_concept: "bonus tip",
  };
}

function buildLifestyleCaption(post: LifestylePost): string {
  const typesList = post.types
    .map((t) => `· ${t.name} — ${t.trait}`)
    .join("\n");
  return `${post.topic.replace(/\n/g, " ")}

${post.hookBody}

▷ 5가지 유형
${typesList}

▷ 결론
${post.conclusion}

▷ ${post.shareHook}

▷ 더 많은 자취 콘텐츠 → @soyo.recipe`;
}

function buildLifestyleHashtags(post: LifestylePost): string[] {
  const base = [
    "#자취일상",
    "#1인가구",
    "#자취생활",
    "#자취식단",
    "#소요앱",
    "#자취공감",
  ];
  const topic = post.topic.replace(/\n/g, "").replace(/\s+/g, "");
  if (topic.includes("유형")) base.push("#자취유형", "#나의자취");
  if (topic.includes("MBTI")) base.push("#MBTI", "#성향별식단");
  if (topic.includes("점수")) base.push("#식비테스트", "#자취테스트");
  if (topic.includes("흑역사")) base.push("#자취흑역사", "#공감", "#위로");
  if (topic.includes("진실")) base.push("#자취팩트", "#자취리얼");
  base.push(`#${topic}`);
  return base;
}
