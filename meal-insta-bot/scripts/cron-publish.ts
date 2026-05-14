/**
 * GitHub Actions cron 진입점 — Vercel 함수 대신 Ubuntu runner에서 실행.
 *
 * 환경변수:
 *   SLOT=lunch | evening  (필수 — 어느 슬롯 게시할지)
 *   PUBLIC_BASE_URL=https://meal-insta-bot.vercel.app  (필수 — /render 호출용)
 *   IG_ACCESS_TOKEN, IG_USER_ID (필수)
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (필수)
 *   SLACK_WEBHOOK_URL (옵션 — 알림)
 *
 * Vercel의 /api/cron/daily-publish 로직과 동일. /api/publish 내부 호출 대신 직접 실행.
 */

import { RECIPES } from "../lib/recipe-source";
import { WEEKLY_MENUS } from "../lib/weekly-menus";
import { DIET_INFOS } from "../lib/diet-infos";
import { LIFESTYLE_POSTS } from "../lib/lifestyle-posts";
import { HACK_POSTS } from "../lib/hack-posts";
import { CHALLENGE_POSTS } from "../lib/challenge-posts";
import { COMPARE_POSTS } from "../lib/compare-posts";
import { TRUTH_POSTS } from "../lib/truth-posts";
import { recipeToCards } from "../lib/recipe-to-cards";
import { weeklyMenuToCards } from "../lib/menu-to-cards";
import { dietInfoToCards } from "../lib/info-to-cards";
import { lifestyleToCards } from "../lib/lifestyle-to-cards";
import { hackToCards } from "../lib/hack-to-cards";
import { challengeToCards } from "../lib/challenge-to-cards";
import { compareToCards } from "../lib/compare-to-cards";
import { truthToCards } from "../lib/truth-to-cards";
import { captureDeck } from "../lib/screenshot";
import { uploadDeck } from "../lib/storage";
import { publishCarousel } from "../lib/instagram";
import type { CardNewsContent } from "../lib/content-types";

type Slot = "lunch" | "evening";

interface Picked {
  category:
    | "recipe"
    | "weekly"
    | "diet"
    | "lifestyle"
    | "hack"
    | "challenge"
    | "compare"
    | "truth";
  source: string;
  label: string;
  deck: CardNewsContent;
}

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

/**
 * 알고리즘 친화 콘텐츠 분배.
 *
 * 핵심 원칙:
 * - 매일 다른 카테고리 (질림 방지)
 * - 강한 후크 콘텐츠 (truth·compare·challenge) 비중 ↑
 * - 정보형 (recipe·weekly·diet) 비중 ↓
 * - 페르소나·꿀팁은 보조
 *
 * 주간 분배 (14회 게시):
 *   월 점심: truth      | 월 저녁: weekly_menu (식단표)
 *   화 점심: compare    | 화 저녁: diet_info
 *   수 점심: challenge  | 수 저녁: recipe (한 끼)
 *   목 점심: hack       | 목 저녁: diet_info
 *   금 점심: lifestyle  | 금 저녁: recipe
 *   토 점심: truth      | 토 저녁: recipe (주말)
 *   일 점심: compare    | 일 저녁: challenge
 */
function pickContent(date: Date, slot: Slot): Picked {
  const dow = date.getDay(); // 0=일, 1=월, ..., 6=토
  const doy = dayOfYear(date);

  // 점심 슬롯 — 강한 후크 콘텐츠 우선 (저장·공유 트리거)
  if (slot === "lunch") {
    // 월·토: truth (호기심 폭발 — 주 시작·주말 시작)
    if (dow === 1 || dow === 6) {
      const idx = Math.floor(doy / 7) % TRUTH_POSTS.length;
      const p = TRUTH_POSTS[idx];
      return {
        category: "truth",
        source: `truth:${p.id}`,
        label: `[점심:진실] ${p.topic.replace(/\n/g, " ")}`,
        deck: truthToCards(p),
      };
    }
    // 화·일: compare (객관적 비교 — 의사결정 도움)
    if (dow === 2 || dow === 0) {
      const idx = Math.floor(doy / 7) % COMPARE_POSTS.length;
      const p = COMPARE_POSTS[idx];
      return {
        category: "compare",
        source: `compare:${p.id}`,
        label: `[점심:비교] ${p.topic.replace(/\n/g, " ")}`,
        deck: compareToCards(p),
      };
    }
    // 수: challenge (한 주 도전 — 동기부여)
    if (dow === 3) {
      const idx = Math.floor(doy / 7) % CHALLENGE_POSTS.length;
      const p = CHALLENGE_POSTS[idx];
      return {
        category: "challenge",
        source: `challenge:${p.id}`,
        label: `[점심:챌린지] ${p.topic.replace(/\n/g, " ")}`,
        deck: challengeToCards(p),
      };
    }
    // 목: hack (실용 꿀팁)
    if (dow === 4) {
      const idx = Math.floor(doy / 3) % HACK_POSTS.length;
      const h = HACK_POSTS[idx];
      return {
        category: "hack",
        source: `hack:${h.id}`,
        label: `[점심:꿀팁] ${h.topic.replace(/\n/g, " ")}`,
        deck: hackToCards(h),
      };
    }
    // 금: lifestyle (공감·페르소나)
    const idx = Math.floor(doy / 7) % LIFESTYLE_POSTS.length;
    const p = LIFESTYLE_POSTS[idx];
    return {
      category: "lifestyle",
      source: `lifestyle:${p.id}`,
      label: `[점심:라이프] ${p.topic.replace(/\n/g, " ")}`,
      deck: lifestyleToCards(p),
    };
  }

  // 저녁 슬롯 — 정보·실행 (저녁 메뉴 결정 + 내일 계획)
  // 월 → weekly_menu
  if (dow === 1) {
    const idx = Math.floor(doy / 7) % WEEKLY_MENUS.length;
    const m = WEEKLY_MENUS[idx];
    return {
      category: "weekly",
      source: `weekly:${m.id}`,
      label: `[저녁:식단표] ${m.theme}`,
      deck: weeklyMenuToCards(m),
    };
  }
  // 화·목 → diet_info
  if (dow === 2 || dow === 4) {
    const idx = Math.floor(doy / 3) % DIET_INFOS.length;
    const info = DIET_INFOS[idx];
    return {
      category: "diet",
      source: `diet:${info.id}`,
      label: `[저녁:정보] ${info.topic.replace(/\n/g, " ")}`,
      deck: dietInfoToCards(info),
    };
  }
  // 일 → challenge (다음 주 미리 도전)
  if (dow === 0) {
    const idx = (Math.floor(doy / 7) + 1) % CHALLENGE_POSTS.length;
    const p = CHALLENGE_POSTS[idx];
    return {
      category: "challenge",
      source: `challenge:${p.id}`,
      label: `[저녁:챌린지] ${p.topic.replace(/\n/g, " ")}`,
      deck: challengeToCards(p),
    };
  }
  // 수·금·토 → 묵직한 저녁 한 끼
  const dinnerPool = RECIPES.filter(
    (r) =>
      (r.category === "한식" && r.time > 10) || r.category === "일식",
  );
  const pool = dinnerPool.length > 0 ? dinnerPool : RECIPES;
  const recipe = pool[doy % pool.length];
  return {
    category: "recipe",
    source: `recipe:${recipe.id}`,
    label: `[저녁] ${recipe.name}`,
    deck: recipeToCards(recipe),
  };
}

async function notifySlack(text: string) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (e) {
    console.warn("[slack] notify failed:", e);
  }
}

async function main() {
  const startedAt = Date.now();
  const slot = (process.env.SLOT ?? "evening") as Slot;
  if (slot !== "lunch" && slot !== "evening") {
    throw new Error(`Invalid SLOT: ${slot} (must be lunch or evening)`);
  }

  const now = new Date();
  const picked = pickContent(now, slot);
  const today = now.toISOString().slice(0, 10);

  console.log(`[cron-publish] ${now.toISOString()} slot=${slot} → ${picked.category}/${picked.label}`);

  // 디버그 — env 검증
  const baseUrl = (process.env.PUBLIC_BASE_URL ?? "").trim();
  console.log(`[debug] PUBLIC_BASE_URL=[${baseUrl}] length=${baseUrl.length}`);
  if (!baseUrl || !baseUrl.startsWith("http")) {
    throw new Error(
      `PUBLIC_BASE_URL invalid or missing: "${process.env.PUBLIC_BASE_URL}"`,
    );
  }

  try {
    // 1. 캡처 (baseUrl 명시 전달)
    console.log(`[1/3] capturing ${picked.deck.cards.length} cards from ${baseUrl}...`);
    const buffers = await captureDeck({
      source: picked.source,
      cardCount: picked.deck.cards.length,
      baseUrl,
    });
    console.log(`      OK — ${buffers.length} PNGs`);

    // 2. 업로드
    console.log(`[2/3] uploading to Supabase...`);
    const urls = await uploadDeck(buffers, {
      date: today,
      source: picked.source,
    });
    console.log(`      OK — ${urls.length} URLs`);

    // 3. 게시
    console.log(`[3/3] publishing carousel to Instagram...`);
    const caption =
      picked.deck.caption + "\n\n" + picked.deck.hashtags.join(" ");
    const result = await publishCarousel({ imageUrls: urls, caption });
    console.log(`      OK — postId=${result.postId}`);

    const durationMs = Date.now() - startedAt;
    await notifySlack(
      `✅ [meal-insta-bot] ${picked.category}/${picked.label} 게시 완료\nIG postId: ${result.postId}\nDuration: ${durationMs}ms`,
    );
    console.log(`\n✓ DONE in ${durationMs}ms — postId=${result.postId}`);
    process.exit(0);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`\n✗ FAILED:`, msg);
    await notifySlack(
      `🚨 [meal-insta-bot] cron 실패 (${picked.category}/${picked.label})\n${msg}`,
    );
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
