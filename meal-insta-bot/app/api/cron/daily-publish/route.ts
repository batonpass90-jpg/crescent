/**
 * GET /api/cron/daily-publish
 *
 * Vercel Cron이 하루 2회 호출:
 *   02:30 UTC = 11:30 KST (점심) → 가벼운 한 끼 (양식·샐러드·간식·빠른 한식)
 *   09:00 UTC = 18:00 KST (저녁) → 묵직한 한식·일식 + 월(weekly)·화목(diet)
 *
 * UTC 시간으로 슬롯 자동 판별 (lunch / evening).
 * 각 풀에서 연중일자 기준 라운드로빈으로 콘텐츠 선택.
 */

import { NextResponse } from "next/server";
import { RECIPES } from "@/lib/recipe-source";
import { WEEKLY_MENUS } from "@/lib/weekly-menus";
import { DIET_INFOS } from "@/lib/diet-infos";
import { LIFESTYLE_POSTS } from "@/lib/lifestyle-posts";
import { HACK_POSTS } from "@/lib/hack-posts";

export const runtime = "nodejs";
export const maxDuration = 300;

interface PickedContent {
  category: "recipe" | "weekly" | "diet" | "lifestyle" | "hack";
  id: string;
  label: string;
  body: {
    recipeId?: string;
    weeklyId?: string;
    dietId?: string;
    lifestyleId?: string;
    hackId?: string;
  };
}

function authorize(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = request.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

type Slot = "lunch" | "evening";

/**
 * UTC 시간 기준 슬롯 자동 판별.
 * 02:30 UTC 호출 → "lunch" (오차 6시간 이내)
 * 09:00 UTC 호출 → "evening"
 * 수동 테스트 시간엔 query string ?slot=lunch 우선.
 */
function detectSlot(date: Date, urlParam?: string | null): Slot {
  if (urlParam === "lunch" || urlParam === "evening") return urlParam;
  const hourUtc = date.getUTCHours();
  // 06:00 UTC 이전 호출은 점심 슬롯, 그 이후는 저녁
  return hourUtc < 6 ? "lunch" : "evening";
}

function pickContent(date: Date, slot: Slot): PickedContent {
  const dow = date.getDay();
  const doy = dayOfYear(date);

  // ── 점심 슬롯 (11:30 KST) ─────────────────────────────────
  // 월/수/금: 한 끼 레시피 (가벼운 음식)
  // 화/목: 자취 꿀팁 (저장 유도형)
  // 토/일: 페르소나 진단 (공유 유도형)
  if (slot === "lunch") {
    if (dow === 2 || dow === 4) {
      const idx = Math.floor(doy / 3) % HACK_POSTS.length;
      const hack = HACK_POSTS[idx];
      return {
        category: "hack",
        id: hack.id,
        label: `[점심:꿀팁] ${hack.topic.replace(/\n/g, " ")}`,
        body: { hackId: hack.id },
      };
    }
    if (dow === 0 || dow === 6) {
      const idx = Math.floor(doy / 7) % LIFESTYLE_POSTS.length;
      const post = LIFESTYLE_POSTS[idx];
      return {
        category: "lifestyle",
        id: post.id,
        label: `[점심:공감] ${post.topic.replace(/\n/g, " ")}`,
        body: { lifestyleId: post.id },
      };
    }
    // 월·수·금 점심 → 가벼운 한 끼 레시피
    const lunchPool = RECIPES.filter(
      (r) =>
        r.category === "양식" ||
        r.category === "샐러드" ||
        r.category === "간식" ||
        (r.category === "한식" && r.time <= 10),
    );
    const pool = lunchPool.length > 0 ? lunchPool : RECIPES;
    const idx = doy % pool.length;
    const recipe = pool[idx];
    return {
      category: "recipe",
      id: recipe.id,
      label: `[점심] ${recipe.name}`,
      body: { recipeId: recipe.id },
    };
  }

  // ── 저녁 슬롯 (18:00 KST) ────────────────────────────────
  // 월: 주간 식단표 / 화·목: 식단 정보 / 수·금·토·일: 묵직한 저녁 레시피

  // 월요일 → 주간 식단표
  if (dow === 1) {
    const idx = Math.floor(doy / 7) % WEEKLY_MENUS.length;
    const menu = WEEKLY_MENUS[idx];
    return {
      category: "weekly",
      id: menu.id,
      label: `[저녁:식단표] ${menu.theme}`,
      body: { weeklyId: menu.id },
    };
  }

  // 화·목 → 식단 정보
  if (dow === 2 || dow === 4) {
    const idx = Math.floor(doy / 3) % DIET_INFOS.length;
    const info = DIET_INFOS[idx];
    return {
      category: "diet",
      id: info.id,
      label: `[저녁:정보] ${info.topic.replace(/\n/g, " ")}`,
      body: { dietId: info.id },
    };
  }

  // 수·금·토·일 → 묵직한 한식·일식
  const dinnerPool = RECIPES.filter(
    (r) =>
      (r.category === "한식" && r.time > 10) || r.category === "일식",
  );
  const pool = dinnerPool.length > 0 ? dinnerPool : RECIPES;
  const idx = doy % pool.length;
  const recipe = pool[idx];
  return {
    category: "recipe",
    id: recipe.id,
    label: `[저녁] ${recipe.name}`,
    body: { recipeId: recipe.id },
  };
}

export async function GET(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const slotParam = new URL(request.url).searchParams.get("slot");
  const slot = detectSlot(now, slotParam);
  const picked = pickContent(now, slot);
  console.log(
    `[cron] ${now.toISOString()} slot=${slot} dow=${now.getDay()} — ${picked.category}/${picked.label}`,
  );

  const base =
    process.env.PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/publish`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-cron-secret": process.env.CRON_SECRET ?? "",
    },
    body: JSON.stringify(picked.body),
  });
  const data = await res.json();

  if (!res.ok) {
    await notifySlack(
      `🚨 [meal-insta-bot] cron 실패 (${picked.category}/${picked.label})\n${data.detail ?? data.error}`,
    );
    return NextResponse.json(
      { ok: false, picked, error: data },
      { status: 500 },
    );
  }

  await notifySlack(
    `✅ [meal-insta-bot] ${picked.category}/${picked.label} 게시 완료\nIG postId: ${data.postId}\nDuration: ${data.durationMs}ms`,
  );
  return NextResponse.json({
    ok: true,
    picked,
    postId: data.postId,
  });
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
    console.warn("[cron] slack notify failed:", e);
  }
}
