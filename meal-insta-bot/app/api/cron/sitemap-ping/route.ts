/**
 * GET /api/cron/sitemap-ping
 *
 * 매일 1회 (08:00 UTC = 17:00 KST) 검색엔진에 sitemap 갱신 알림.
 * 새 콘텐츠가 빨리 색인되도록 ping.
 *
 * 구글: deprecated (sitemaps.xml은 Search Console에서 자동 발견)
 * 네이버: webmastertools에 등록되어 있으면 자동 크롤링
 * → 실제론 cron보단 등록 후 자동 크롤링이 더 신뢰성 높음.
 *   이 endpoint는 보조 역할 + 로깅용.
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BASE_URL =
  process.env.PUBLIC_BASE_URL ?? "https://meal-insta-bot.vercel.app";

function authorize(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = request.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

interface PingResult {
  service: string;
  status: number | string;
  ok: boolean;
}

async function ping(url: string, service: string): Promise<PingResult> {
  try {
    const res = await fetch(url, { method: "GET" });
    return { service, status: res.status, ok: res.ok };
  } catch (e) {
    return { service, status: String(e), ok: false };
  }
}

export async function GET(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sitemapUrl = `${BASE_URL}/sitemap.xml`;
  const encoded = encodeURIComponent(sitemapUrl);

  // 검색엔진별 ping URL
  const results = await Promise.all([
    ping(`https://www.bing.com/ping?sitemap=${encoded}`, "bing"),
    // 네이버는 별도 ping API 없음 — 등록만 하면 자동 크롤링
    // 구글은 2023년 6월부로 ping deprecated → Search Console에서 자동 발견
  ]);

  return NextResponse.json({
    ok: results.every((r) => r.ok),
    sitemap: sitemapUrl,
    pings: results,
    note: "구글·네이버는 등록 후 자동 크롤링이 더 신뢰성 높음. 이 ping은 보조용.",
  });
}
