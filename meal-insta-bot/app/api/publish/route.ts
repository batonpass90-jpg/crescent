/**
 * POST /api/publish
 *
 * 본문:
 *   { recipeId: "1" }  → soyo RECIPES[id=1]을 8장 카드로 캡처·업로드·게시
 *
 * 흐름:
 *   1. recipeToCards(recipe) → 8장 카드 정의
 *   2. captureDeck → Puppeteer 8회 → PNG 8개 buffer
 *   3. uploadDeck → Supabase Storage 업로드 → public URL 8개
 *   4. publishCarousel → IG Graph API
 *   5. 응답: { postId, urls, durationMs }
 *
 * 인증: 헤더 `x-cron-secret: <CRON_SECRET>` 또는 사람 호출시 사이트 인증.
 *       지금은 단순화 위해 CRON_SECRET 매치만 체크.
 */

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { findRecipe } from "@/lib/recipe-source";
import { recipeToCards } from "@/lib/recipe-to-cards";
import { captureDeck } from "@/lib/screenshot";
import { uploadDeck } from "@/lib/storage";
import { publishCarousel } from "@/lib/instagram";

export const runtime = "nodejs";
export const maxDuration = 300; // Puppeteer + IG 처리 시간

interface PublishBody {
  recipeId?: string;
  /** true면 IG·Supabase 우회. PNG를 .dry-run/ 폴더에 저장 후 종료. */
  dryRun?: boolean;
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

  const recipeId = body.recipeId;
  if (!recipeId) {
    return NextResponse.json(
      { error: "recipeId is required" },
      { status: 400 },
    );
  }

  const recipe = findRecipe(recipeId);
  if (!recipe) {
    return NextResponse.json(
      { error: `Recipe ${recipeId} not found` },
      { status: 404 },
    );
  }

  const startedAt = Date.now();
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const source = `recipe:${recipe.id}`;
  const dryRun =
    body.dryRun === true ||
    new URL(request.url).searchParams.get("dryRun") === "1";

  try {
    // 1. 카드 정의
    const deck = recipeToCards(recipe);
    console.log(
      `[publish${dryRun ? ":dry-run" : ""}] ${recipe.name} — ${deck.cards.length} cards`,
    );

    // 2. 캡처
    const buffers = await captureDeck({
      source,
      cardCount: deck.cards.length,
    });
    console.log(`[publish] captured ${buffers.length} PNGs`);

    // 캡션 (dry-run에서도 검증용으로 만듦)
    const caption = deck.caption + "\n\n" + deck.hashtags.join(" ");

    // 3-DRY. 로컬 폴더에 저장만 하고 종료
    if (dryRun) {
      const outDir = path.join(
        process.cwd(),
        ".dry-run",
        today,
        `recipe-${recipe.id}`,
      );
      await fs.mkdir(outDir, { recursive: true });
      const paths: string[] = [];
      for (let i = 0; i < buffers.length; i++) {
        const p = path.join(outDir, `card-${String(i).padStart(2, "0")}.png`);
        await fs.writeFile(p, buffers[i]);
        paths.push(p);
      }
      const captionPath = path.join(outDir, "caption.txt");
      await fs.writeFile(captionPath, caption, "utf-8");
      console.log(`[publish:dry-run] saved ${paths.length} PNGs to ${outDir}`);
      return NextResponse.json({
        ok: true,
        dryRun: true,
        recipe: { id: recipe.id, name: recipe.name },
        cardCount: deck.cards.length,
        outDir,
        paths,
        captionPreview: caption.slice(0, 200) + "...",
        durationMs: Date.now() - startedAt,
      });
    }

    // 3. 업로드
    const urls = await uploadDeck(buffers, { date: today, source });
    console.log(`[publish] uploaded to Supabase: ${urls.length} URLs`);

    // 4. 게시
    const result = await publishCarousel({ imageUrls: urls, caption });
    console.log(`[publish] IG post ${result.postId} published`);

    return NextResponse.json({
      ok: true,
      postId: result.postId,
      recipe: { id: recipe.id, name: recipe.name },
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
    body: { recipeId: "1" },
    auth: "header x-cron-secret: <CRON_SECRET>",
    durationEstimate: "약 60~120초 (Puppeteer 8회 + IG carousel 폴링)",
  });
}
