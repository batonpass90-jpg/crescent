import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "쇼츠 대본 생성기 | Crescent Studio",
  description: "영상과 상품명만으로 후킹 쇼츠 대본을 자동 생성하는 팀 내부 도구",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
