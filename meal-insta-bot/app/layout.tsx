import type { Metadata } from "next";
import "./globals.css";

function resolveSiteUrl(): string {
  const explicit = process.env.PUBLIC_BASE_URL?.trim();
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "https://meal-insta-bot.vercel.app";
}

const SITE_URL = resolveSiteUrl();

function buildVerification() {
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  const naver = process.env.NAVER_SITE_VERIFICATION?.trim();
  const verification: { google?: string; other?: Record<string, string> } = {};
  if (google) verification.google = google;
  if (naver) verification.other = { "naver-site-verification": naver };
  return verification;
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "소요 — 자취 식단 가이드",
    template: "%s | 소요",
  },
  description:
    "자취생을 위한 50+ 한 끼 레시피·주간 식단표·영양 가이드. 매일 11:30·18:00 새 콘텐츠.",
  applicationName: "소요",
  keywords: [
    "자취",
    "자취식단",
    "1인가구",
    "자취요리",
    "혼밥",
    "10분요리",
    "초간단요리",
    "한식",
    "다이어트식단",
    "식단표",
    "영양정보",
  ],
  authors: [{ name: "소요" }],
  creator: "소요",
  publisher: "소요",
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [{ url: "/rss.xml", title: "소요 블로그 RSS" }],
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "소요 — 자취 식단 가이드",
    title: "소요 — 자취 식단 가이드",
    description:
      "자취생을 위한 50+ 검증된 레시피·식단표·영양 가이드. 매일 11:30·18:00 업데이트.",
    url: SITE_URL,
  },
  // 네이버·구글·다음 사이트 인증 메타태그 (env로 주입)
  // 각 콘솔에서 발급받은 인증 코드를 환경변수로 등록.
  verification: buildVerification(),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
