/**
 * Next.js sitemap.ts — /sitemap.xml 자동 생성.
 *
 * 검색엔진(구글·네이버·다음)에 모든 블로그 페이지 발견시키기.
 * 네이버 서치어드바이저, 구글 Search Console에 이 URL 등록.
 */

import type { MetadataRoute } from "next";
import { RECIPES } from "@/lib/recipe-source";
import { WEEKLY_MENUS } from "@/lib/weekly-menus";
import { DIET_INFOS } from "@/lib/diet-infos";
import { LIFESTYLE_POSTS } from "@/lib/lifestyle-posts";
import { HACK_POSTS } from "@/lib/hack-posts";

const BASE_URL = process.env.PUBLIC_BASE_URL ?? "https://meal-insta-bot.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, priority: 0.5 },
    { url: `${BASE_URL}/blog`, lastModified: now, priority: 1.0, changeFrequency: "daily" },
    { url: `${BASE_URL}/blog?category=recipe`, lastModified: now, priority: 0.8 },
    { url: `${BASE_URL}/blog?category=weekly`, lastModified: now, priority: 0.8 },
    { url: `${BASE_URL}/blog?category=diet`, lastModified: now, priority: 0.8 },
  ];

  const recipePages: MetadataRoute.Sitemap = RECIPES.map((r) => ({
    url: `${BASE_URL}/blog/recipe/${r.id}`,
    lastModified: now,
    priority: 0.7,
    changeFrequency: "weekly",
  }));

  const weeklyPages: MetadataRoute.Sitemap = WEEKLY_MENUS.map((m) => ({
    url: `${BASE_URL}/blog/weekly/${m.id}`,
    lastModified: now,
    priority: 0.7,
    changeFrequency: "weekly",
  }));

  const dietPages: MetadataRoute.Sitemap = DIET_INFOS.map((d) => ({
    url: `${BASE_URL}/blog/diet/${d.id}`,
    lastModified: now,
    priority: 0.7,
    changeFrequency: "weekly",
  }));

  const lifestylePages: MetadataRoute.Sitemap = LIFESTYLE_POSTS.map((p) => ({
    url: `${BASE_URL}/blog/lifestyle/${p.id}`,
    lastModified: now,
    priority: 0.7,
    changeFrequency: "weekly",
  }));

  const hackPages: MetadataRoute.Sitemap = HACK_POSTS.map((h) => ({
    url: `${BASE_URL}/blog/hack/${h.id}`,
    lastModified: now,
    priority: 0.7,
    changeFrequency: "weekly",
  }));

  return [
    ...staticPages,
    ...recipePages,
    ...weeklyPages,
    ...dietPages,
    ...lifestylePages,
    ...hackPages,
  ];
}
