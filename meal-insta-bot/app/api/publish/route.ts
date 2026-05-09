/**
 * POST /api/publish
 *
 * 본문 (셋 중 하나):
 *   { recipeId: "1" }   → soyo RECIPES[id=1] 한 끼 게시
 *   { weeklyId: "1" }   → 주간 식단표 게시
 *   { dietId: "1" }     → 식단 정보 게시
 *
 * 옵션:
 *   { dryRun: true }    → IG·Supabase 우회, 로컬 PNG만 저장
 *
 * 흐름:
 *   1. 소스 → 카드 정의 (recipeToCards / weeklyMenuToCards / dietInfoToCards)
 *   2. captureDeck → Puppeteer로 8장 PNG
 *   3. uploadDeck → Supabase Storage → public URL
 *   4. publishCarousel → IG Graph API
 *
 * 인증: 헤더 `x-cron-secret: <CRON_SECRET>`
 */

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { CardNewsContent } from "@/lib/content-types";
import { findRecipe } from "@/lib/recipe-source";
import { recipeToCards } from "@/lib/recipe-to-cards";
import { findWeeklyMenu } from "@/lib/weekly-menus";
import { weeklyMenuToCards } from "@/lib/menu-to-cards";
import { findDietInfo } from "@/lib/diet-infos";
import { dietInfoToCards } from "@/lib/info-to-cards";
import { findLifestylePost } from "@/lib/lifestyle-posts";
import { lifestyleToCards } from "@/lib/lifestyle-to-cards";
import { findHackPost } from "@/lib/hack-posts";
import { hackToCards } from "@/lib/hack-to-cards";
import { captureDeck } from "@/lib/screenshot";
import { uploadDeck } from "@/lib/storage";
import { publishCarousel } from "@/lib/instagram";

export const runtime = "nodejs";
export const maxDuration = 300;

interface PublishBody {
  recipeId?: string;
  weeklyId?: string;
  dietId?: string;
  lifestyleId?: string;
  hackId?: string;
  dryRun?: boolean;
}

interface ResolvedSource {
  source: string;
  label: string;
  deck: CardNewsContent;
  category: "recipe" | "weekly" | "diet" | "lifestyle" | "hack";
}

function resolveSource(body: PublishBody): ResolvedSource | { error: string } {
  if (body.recipeId) {
    const recipe = findRecipe(body.recipeId);
    if (!recipe) return { error: `Recipe ${body.recipeId} not found` };
    return {
      source: `recipe:${recipe.id}`,
      label: recipe.name,
      deck: recipeToCards(recipe),
      category: "recipe",
    };
  }
  if (body.weeklyId) {
    const menu = findWeeklyMenu(body.weeklyId);
    if (!menu) return { error: `Weekly menu ${body.weeklyId} not found` };
    return {
      source: `weekly:${menu.id}`,
      label: menu.theme,
      deck: weeklyMenuToCards(menu),
      category: "weekly",
    };
  }
  if (body.dietId) {
    const info = findDietInfo(body.dietId);
    if (!info) return { error: `Diet info ${body.dietId} not found` };
    return {
      source: `diet:${info.id}`,
      label: info.topic.replace(/\n/g, " "),
      deck: dietInfoToCards(info),
      category: "diet",
    };
  }
  if (body.lifestyleId) {
    const post = findLifestylePost(body.lifestyleId);
    if (!post) return { error: `Lifestyle ${body.lifestyleId} not found` };
    return {
      source: `lifestyle:${post.id}`,
      label: post.topic.replace(/\n/g, " "),
      deck: lifestyleToCards(post),
      category: "lifestyle",
    };
  }
  if (body.hackId) {
    const post = findHackPost(body.hackId);
    if (!post) return { error: `Hack ${body.hackId} not found` };
    return {
      source: `hack:${post.id}`,
      label: post.topic.replace(/\n/g, " "),
      deck: hackToCards(post),
      category: "hack",
    };
  }
  return { error: "Body must contain recipeId / weeklyId / dietId / lifestyleId / hackId" };
}

function authorize(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev mode
  const provided =
    request.headers.get("x-cron-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    "";
  return provided === secret;
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: PublishBody;
  try {
    body = (await request.json()) as PublishBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const resolved = resolveSource(body);
  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: 400 });
  }
  const { source, label, deck, category } = resolved;

  const startedAt = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  const dryRun =
    body.dryRun === true ||
    new URL(request.url).searchParams.get("dryRun") === "1";

  try {
    console.log(
      `[publish${dryRun ? ":dry-run" : ""}] ${category}/${label} — ${deck.cards.length} cards`,
    );

    // 1. 캡처
    const buffers = await captureDeck({
      source,
      cardCount: deck.cards.length,
    });
    console.log(`[publish] captured ${buffers.length} PNGs`);

    // 캡션
    const caption = deck.caption + "\n\n" + deck.hashtags.join(" ");

    // 2-DRY. 로컬 폴더에 저장만
    if (dryRun) {
      const sourceSlug = source.replace(":", "_");
      const outDir = path.join(
        process.cwd(),
        ".dry-run",
        today,
        sourceSlug,
      );
      await fs.mkdir(outDir, { recursive: true });
      const paths: string[] = [];
      for (let i = 0; i < buffers.length; i++) {
        const p = path.join(outDir, `card-${String(i).padStart(2, "0")}.png`);
        await fs.writeFile(p, buffers[i]);
        paths.push(p);
      }
      await fs.writeFile(path.join(outDir, "caption.txt"), caption, "utf-8");
      console.log(`[publish:dry-run] saved ${paths.length} PNGs to ${outDir}`);
      return NextResponse.json({
        ok: true,
        dryRun: true,
        category,
        source: { type: category, label },
        cardCount: deck.cards.length,
        outDir,
        paths,
        captionPreview: caption.slice(0, 200) + "...",
        durationMs: Date.now() - startedAt,
      });
    }

    // 2. 업로드
    const urls = await uploadDeck(buffers, { date: today, source });
    console.log(`[publish] uploaded to Supabase: ${urls.length} URLs`);

    // 3. 게시
    const result = await publishCarousel({ imageUrls: urls, caption });
    console.log(`[publish] IG post ${result.postId} published`);

    return NextResponse.json({
      ok: true,
      postId: result.postId,
      category,
      source: { type: category, label },
      cardCount: deck.cards.length,
      urls,
      durationMs: Date.now() - startedAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[publish] failed:`, message);
    return NextResponse.json(
      {
        ok: false,
        error: "Publish failed",
        detail: message,
        durationMs: Date.now() - startedAt,
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/publish",
    body: {
      "(택1)": ["recipeId: 1~50", "weeklyId: 1~8", "dietId: 1~8"],
      "옵션": "dryRun: true",
    },
    auth: "header x-cron-secret: <CRON_SECRET>",
    durationEstimate: "약 60~120초 (Puppeteer 8회 + IG carousel 폴링)",
  });
}
