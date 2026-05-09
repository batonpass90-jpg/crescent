/**
 * GET /api/cron/daily-publish
 *
 * Vercel Cron이 매일 18:00 KST(=09:00 UTC) 호출.
 * 요일별로 다른 카테고리 게시:
 *   월(1)        → 주간 식단표 (weekly_menu)
 *   화(2)·목(4)  → 식단 정보 (diet_info)
 *   수(3)·금(5)·토(6)·일(0) → 오늘의 한 끼 (recipe)
 *
 * 각 풀에서 연중일자 % 풀크기로 라운드로빈 → 같은 날 재실행해도 같은 콘텐츠.
 */

import { NextResponse } from "next/server";
import { RECIPES } from "@/lib/recipe-source";
import { WEEKLY_MENUS } from "@/lib/weekly-menus";
import { DIET_INFOS } from "@/lib/diet-infos";

export const runtime = "nodejs";
export const maxDuration = 300;

interface PickedContent {
  category: "recipe" | "weekly" | "diet";
  id: string;
  label: string;
  body: { recipeId?: string; weeklyId?: string; dietId?: string };
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

function pickContent(date: Date): PickedContent {
  const dow = date.getDay(); // 0(일) ~ 6(토)
  const doy = dayOfYear(date);

  // 월요일 → 주간 식단표
  if (dow === 1) {
    const idx = Math.floor(doy / 7) % WEEKLY_MENUS.length;
    const menu = WEEKLY_MENUS[idx];
    return {
      category: "weekly",
      id: menu.id,
      label: menu.theme,
      body: { weeklyId: menu.id },
    };
  }

  // 화·목 → 식단 정보
  if (dow === 2 || dow === 4) {
    // 일년 중 화·목 인덱스 (대략 doy/3.5)
    const idx = Math.floor(doy / 3) % DIET_INFOS.length;
    const info = DIET_INFOS[idx];
    return {
      category: "diet",
      id: info.id,
      label: info.topic.replace(/\n/g, " "),
      body: { dietId: info.id },
    };
  }

  // 수·금·토·일 → 한 끼 레시피
  const idx = doy % RECIPES.length;
  const recipe = RECIPES[idx];
  return {
    category: "recipe",
    id: recipe.id,
    label: recipe.name,
    body: { recipeId: recipe.id },
  };
}

export async function GET(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const picked = pickContent(now);
  console.log(
    `[cron] ${now.toISOString()} (dow=${now.getDay()}) — ${picked.category}/${picked.label}`,
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
