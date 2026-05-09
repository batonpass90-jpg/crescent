/**
 * GET /rss.xml
 *
 * 블로그 RSS 피드 — 네이버 인플루언서·구독자용.
 * 모든 포스트를 최신순으로 RSS 2.0 형식으로 반환.
 */

import { RECIPES } from "@/lib/recipe-source";
import { WEEKLY_MENUS } from "@/lib/weekly-menus";
import { DIET_INFOS } from "@/lib/diet-infos";

const BASE_URL =
  process.env.PUBLIC_BASE_URL ?? "https://meal-insta-bot.vercel.app";

export const dynamic = "force-static";
export const revalidate = 86400; // 하루 1번 재생성

interface FeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
  category: string;
}

function buildFeed(): FeedItem[] {
  const now = new Date().toUTCString();

  const recipes: FeedItem[] = RECIPES.map((r) => ({
    title: `${r.name} 레시피 — ${r.time}분, ${r.kcal}kcal`,
    link: `${BASE_URL}/blog/recipe/${r.id}`,
    description: r.tip ?? `자취 5년차의 ${r.name} 레시피.`,
    pubDate: now,
    guid: `${BASE_URL}/blog/recipe/${r.id}`,
    category: r.category,
  }));

  const weeklies: FeedItem[] = WEEKLY_MENUS.map((m) => ({
    title: `${m.theme} 일주일 식단표 — ${m.budget}`,
    link: `${BASE_URL}/blog/weekly/${m.id}`,
    description: m.description,
    pubDate: now,
    guid: `${BASE_URL}/blog/weekly/${m.id}`,
    category: "식단표",
  }));

  const diets: FeedItem[] = DIET_INFOS.map((d) => ({
    title: d.topic.replace(/\n/g, " "),
    link: `${BASE_URL}/blog/diet/${d.id}`,
    description: d.hookBody.replace(/\n/g, " "),
    pubDate: now,
    guid: `${BASE_URL}/blog/diet/${d.id}`,
    category: "영양정보",
  }));

  return [...recipes, ...weeklies, ...diets];
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const items = buildFeed();
  const lastBuild = new Date().toUTCString();

  const itemsXml = items
    .map(
      (i) => `    <item>
      <title>${escapeXml(i.title)}</title>
      <link>${i.link}</link>
      <guid>${i.guid}</guid>
      <pubDate>${i.pubDate}</pubDate>
      <category>${escapeXml(i.category)}</category>
      <description>${escapeXml(i.description)}</description>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>소요 — 자취 식단 가이드</title>
    <link>${BASE_URL}/blog</link>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>자취생을 위한 50+ 한 끼 레시피 · 주간 식단표 · 영양 정보. 매일 11:30 / 18:00 새 콘텐츠.</description>
    <language>ko-KR</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
