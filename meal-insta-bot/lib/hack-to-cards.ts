/**
 * HackPost → 8장 카드뉴스 시퀀스.
 *
 * 시퀀스 (저장 유도형):
 *   01 커버 (페인+숫자 약속)
 *   02 문제 정의 (저장 유발 강한 후크)
 *   03 5단계 해결법 1-2
 *   04 5단계 해결법 3-4
 *   05 5단계 해결법 5
 *   06 실전 예시 (구체 숫자)
 *   07 저장 유도 (명시적 행동 지침)
 *   08 CTA (소요 앱)
 */

import type { CardNewsContent } from "./content-types";
import type { HackPost } from "./hack-posts";
import { SoyoFeatures } from "./soyo-tokens";

export function hackToCards(post: HackPost): CardNewsContent {
  const steps = post.steps;

  return {
    title: `${post.hookSubtitle} — ${post.topic.replace(/\n/g, " ")}`,
    cards: [
      // 01 커버 — 강한 후크 (페인+숫자)
      {
        headline: post.topic,
        body: post.hookBody,
        image_concept: post.photoQuery,
        subtitle: post.hookSubtitle,
      },

      // 02 문제 정의 — 저장 유발 (당신도 그렇지 않나요?)
      {
        headline: "이 중\n하나라도?",
        subtitle: post.problem.title,
        body: "하나라도 해당되면 저장하고 다시 꺼내봐요.",
        rows: post.problem.rows,
        image_concept: "problem identification",
      },

      // 03 단계 1-2
      {
        headline: "1·2단계",
        subtitle: "시작",
        body: "",
        rows: steps.slice(0, 2).map((s) => ({
          label: `${s.label}. ${s.action}`,
          value: s.detail,
        })),
        image_concept: "first steps",
      },

      // 04 단계 3-4
      {
        headline: "3·4단계",
        subtitle: "응용",
        body: "",
        rows: steps.slice(2, 4).map((s) => ({
          label: `${s.label}. ${s.action}`,
          value: s.detail,
        })),
        image_concept: "middle steps",
      },

      // 05 단계 5
      {
        headline: "5단계",
        subtitle: "마무리",
        body: "",
        rows: steps.slice(4).map((s) => ({
          label: `${s.label}. ${s.action}`,
          value: s.detail,
        })),
        callout: {
          tone: "tip",
          text: "5단계 다 적용 = 자취 5년차 효율 달성.",
        },
        image_concept: "final step",
      },

      // 06 실전 예시 (구체 숫자)
      {
        headline: "실전\n예시",
        subtitle: post.example.title,
        body: "",
        rows: post.example.rows,
        image_concept: "real example numbers",
      },

      // 07 저장 유도 (명시적)
      {
        headline: "다음에\n또 보기",
        subtitle: "저장 핵심 카드",
        body: "",
        rows: [
          { label: "저장", value: post.saveHook },
          { label: "공유", value: "자취 친구한테 태그" },
          { label: "팔로우", value: "매일 11:30·18:00 새 꿀팁" },
        ],
        callout: {
          tone: "tip",
          text: "오른쪽 하단 ⇲ 저장 — 필요할 때 다시 꺼내기.",
        },
        image_concept: "save action",
      },

      // 08 CTA — 소요 앱
      {
        headline: "혼자서도\n잘 먹기",
        subtitle: "자취인 식단앱 · 소요",
        body: "",
        rows: SoyoFeatures.map((f) => ({ label: f.name, value: f.pain })),
        callout: {
          tone: "tip",
          text: "저장 — 다시 꺼낼 때\n친구 태그 — 같이 시작\n팔로우 — 매일 11:30 · 18:00",
        },
        image_concept: "soyo app feature CTA",
      },
    ],
    caption: buildHackCaption(post),
    hashtags: buildHackHashtags(post),
  };
}

function buildHackCaption(post: HackPost): string {
  const stepsList = post.steps
    .map((s) => `${s.label}. ${s.action} — ${s.detail}`)
    .join("\n");
  return `${post.topic.replace(/\n/g, " ")}

${post.hookBody}

▷ 5단계
${stepsList}

▷ 실전 예시
${post.example.title}

▷ ${post.saveHook}

▷ 더 많은 자취 꿀팁 → @soyo.recipe`;
}

function buildHackHashtags(post: HackPost): string[] {
  const base = [
    "#자취꿀팁",
    "#자취생활",
    "#1인가구",
    "#자취팁",
    "#소요앱",
    "#실용정보",
  ];
  const topic = post.topic.replace(/\n/g, "").replace(/\s+/g, "");
  if (topic.includes("유통기한")) base.push("#식재료보관", "#음식물쓰레기");
  if (topic.includes("편의점")) base.push("#편의점도시락", "#영양비교");
  if (topic.includes("냉장고")) base.push("#냉장고파먹기", "#잔반활용");
  if (topic.includes("장보기")) base.push("#장보기팁", "#식비절약");
  if (topic.includes("주말")) base.push("#밀프렙", "#주말요리");
  if (topic.includes("라면")) base.push("#라면레시피", "#라면토핑");
  if (topic.includes("부엌")) base.push("#자취살림", "#부엌도구");
  if (topic.includes("식비")) base.push("#식비절약", "#가성비");
  base.push(`#${topic}`);
  return base;
}
