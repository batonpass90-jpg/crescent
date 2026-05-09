import type { MetadataRoute } from "next";

const BASE_URL = process.env.PUBLIC_BASE_URL ?? "https://meal-insta-bot.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 내부 라우트 차단 (검색엔진에 노출되면 안 됨)
        disallow: ["/render", "/api/", "/preview"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
