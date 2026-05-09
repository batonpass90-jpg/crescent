import Link from "next/link";
import { SoyoColors, SoyoLinks } from "@/lib/soyo-tokens";

export default function HomePage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-5"
      style={{ backgroundColor: SoyoColors.paper }}
    >
      <div className="text-center max-w-md">
        <div
          className="inline-block w-3 h-3 rounded-full mb-6"
          style={{ backgroundColor: SoyoColors.clay }}
        />
        <h1
          className="text-4xl font-black tracking-tight mb-3"
          style={{ color: SoyoColors.ink, letterSpacing: "-0.02em" }}
        >
          소요
        </h1>
        <p
          className="mb-2 text-lg font-medium"
          style={{ color: SoyoColors.ink2 }}
        >
          자취 식단 가이드
        </p>
        <p
          className="mb-10 text-sm"
          style={{ color: SoyoColors.ink3 }}
        >
          50+ 한 끼 레시피 · 주간 식단표 · 영양 정보 — 매일 11:30 / 18:00
        </p>

        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Link
            href="/blog"
            className="block px-6 py-3 rounded-xl font-bold transition hover:opacity-90"
            style={{
              backgroundColor: SoyoColors.clay,
              color: SoyoColors.white,
            }}
          >
            블로그 둘러보기 →
          </Link>
          <a
            href={`https://www.instagram.com/${SoyoLinks.instagramHandle.replace("@", "")}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-6 py-3 rounded-xl font-bold border transition hover:bg-gray-100"
            style={{
              borderColor: SoyoColors.paper3,
              color: SoyoColors.ink,
            }}
          >
            Instagram {SoyoLinks.instagramHandle}
          </a>
        </div>
      </div>
    </main>
  );
}
