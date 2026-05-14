import type { Metadata } from "next";
import Link from "next/link";
import { SoyoColors, SoyoLinks } from "@/lib/soyo-tokens";

export const metadata: Metadata = {
  title: {
    default: "소요 블로그 — 자취 식단 가이드",
    template: "%s | 소요 블로그",
  },
  description:
    "자취생을 위한 한 끼 레시피·주간 식단표·영양 가이드. 50+ 검증된 레시피.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "소요 블로그",
  },
  robots: { index: true, follow: true },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: SoyoColors.paper, color: SoyoColors.ink }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 border-b backdrop-blur-md"
        style={{
          backgroundColor: `${SoyoColors.paper}ee`,
          borderColor: SoyoColors.paper3,
        }}
      >
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: SoyoColors.clay }}
            />
            <span className="font-bold text-lg tracking-tight">
              소요 — 자취 식단 가이드
            </span>
          </Link>
          <nav className="flex gap-3 text-sm font-medium overflow-x-auto">
            <Link href="/blog" className="hover:underline whitespace-nowrap" style={{ color: SoyoColors.ink2 }}>전체</Link>
            <Link href="/blog?category=truth" className="hover:underline whitespace-nowrap font-bold" style={{ color: SoyoColors.clay }}>진실</Link>
            <Link href="/blog?category=compare" className="hover:underline whitespace-nowrap font-bold" style={{ color: SoyoColors.sky }}>비교</Link>
            <Link href="/blog?category=challenge" className="hover:underline whitespace-nowrap font-bold" style={{ color: SoyoColors.clay }}>챌린지</Link>
            <Link href="/blog?category=recipe" className="hover:underline whitespace-nowrap" style={{ color: SoyoColors.ink2 }}>레시피</Link>
            <Link href="/blog?category=weekly" className="hover:underline whitespace-nowrap" style={{ color: SoyoColors.ink2 }}>식단표</Link>
            <Link href="/blog?category=hack" className="hover:underline whitespace-nowrap" style={{ color: SoyoColors.ink2 }}>꿀팁</Link>
            <Link href="/blog?category=lifestyle" className="hover:underline whitespace-nowrap" style={{ color: SoyoColors.ink2 }}>라이프</Link>
            <Link href="/blog?category=diet" className="hover:underline whitespace-nowrap" style={{ color: SoyoColors.ink2 }}>영양</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-5 py-8">{children}</main>

      {/* Footer */}
      <footer
        className="mt-16 border-t py-10"
        style={{ borderColor: SoyoColors.paper3 }}
      >
        <div
          className="max-w-3xl mx-auto px-5 text-center text-sm"
          style={{ color: SoyoColors.ink3 }}
        >
          <p className="mb-2">
            <a
              href={`https://www.instagram.com/${SoyoLinks.instagramHandle.replace(
                "@",
                "",
              )}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold hover:underline"
              style={{ color: SoyoColors.clay }}
            >
              {SoyoLinks.instagramHandle}
            </a>
            {" · 매일 11:30 / 18:00 새 콘텐츠"}
          </p>
          <p>© 2026 소요 — 자취인의 한 끼</p>
        </div>
      </footer>
    </div>
  );
}
