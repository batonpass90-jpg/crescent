/**
 * GET /api/cron/daily-publish
 *
 * Vercel Cron이 매일 오후 6시 KST(=09 UTC) 호출.
 * RECIPES 중 오늘의 레시피를 골라 /api/publish 호출.
 *
 * 인증: Vercel Cron은 자동으로 `Authorization: Bearer ${CRON_SECRET}` 헤더 추가.
 *
 * 레시피 선택 규칙: 날짜 기반 라운드로빈
 *   YYYY-MM-DD → ord(MM-DD) % RECIPES.length → 인덱스
 *   같은 날엔 같은 레시피 (재실행해도 idempotent — 단, IG 게시 자체는 중복 안 막음)
 */

import { NextResponse } from "next/server";
import { RECIPES } from "@/lib/recipe-source";

export const runtime = "nodejs";
export const maxDuration = 300;

function authorize(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev mode
  const auth = request.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

function pickTodaysRecipe(date: Date) {
  // 연중 일자 (1~366) 기준 라운드로빈
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (date.getTime() - start.getTime()) / 86_400_000,
  );
  const idx = dayOfYear % RECIPES.length;
  return RECIPES[idx];
}

export async function GET(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const recipe = pickTodaysRecipe(now);
  console.log(
    `[cron] ${now.toISOString()} — picking ${recipe.name} (id=${recipe.id})`,
  );

  // /api/publish 내부 호출
  const base =
    process.env.PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/publish`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-cron-secret": process.env.CRON_SECRET ?? "",
    },
    body: JSON.stringify({ recipeId: recipe.id }),
  });
  const data = await res.json();

  if (!res.ok) {
    // Slack 알림 (옵션)
    await notifySlack(
      `🚨 [meal-insta-bot] cron 실패\n${recipe.name} — ${data.detail ?? data.error}`,
    );
    return NextResponse.json(
      { ok: false, recipe: recipe.name, error: data },
      { status: 500 },
    );
  }

  await notifySlack(
    `✅ [meal-insta-bot] ${recipe.name} 게시 완료\nIG postId: ${data.postId}\nDuration: ${data.durationMs}ms`,
  );
  return NextResponse.json({
    ok: true,
    recipe: recipe.name,
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
