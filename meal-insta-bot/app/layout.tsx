import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meal Insta Bot",
  description: "자취 식단 인스타 카드뉴스 자동 게시",
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
