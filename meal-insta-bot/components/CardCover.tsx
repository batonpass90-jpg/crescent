import type { CardContent } from "@/lib/content-types";
import { SoyoColors } from "@/lib/soyo-tokens";

export interface CardCoverProps {
  card: CardContent;
  index: number;
  total: number;
  categoryLabel: string;
  bandColor: string;
  handle: string;
  /** @deprecated 표지에서 사진 사용 안 함 — 타이포 위주로 변경. backward compatibility용. */
  photoUrl?: string;
}

/**
 * 타이포 위주 표지 — 음식 사진 제거.
 *
 * 디자인 원칙:
 * - 카테고리 컬러 풀블리드 배경 (clay/sage/sky)
 * - 큰 헤드라인 (잡지 표지 / 뉴스 헤드라인 스타일)
 * - 미니멀 패턴: 좌측 큰 번호 (시리즈 정체성)
 * - 후크 메시지가 표지의 모든 것
 */
export function CardCover({
  card,
  index,
  total,
  categoryLabel,
  bandColor,
  handle,
}: CardCoverProps) {
  // 시리즈 번호 추출 (subtitle 끝의 #NN)
  const seriesMatch = card.subtitle?.match(/#(\d+)/);
  const seriesNumber = seriesMatch ? seriesMatch[1] : null;
  // 시리즈 라벨 (#NN 제거한 부분)
  const seriesLabel = card.subtitle?.replace(/\s*#\d+\s*$/, "") ?? categoryLabel;

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        backgroundColor: bandColor,
        color: SoyoColors.white,
      }}
    >
      {/* 미세한 페이퍼 텍스처 (밴드 컬러 위에 light grain) */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 22% 18%, rgba(255,255,255,0.9) 0px, transparent 1.5px), radial-gradient(circle at 68% 55%, rgba(255,255,255,0.9) 0px, transparent 1px)",
          backgroundSize: "8px 8px, 12px 12px",
        }}
      />

      {/* 우측 큰 번호 (시리즈 정체성, 잡지 표지 스타일) */}
      {seriesNumber && (
        <div
          className="absolute pointer-events-none"
          style={{
            right: "-50px",
            bottom: "-80px",
            fontSize: "600px",
            fontWeight: 900,
            lineHeight: 1,
            opacity: 0.08,
            letterSpacing: "-0.08em",
            color: SoyoColors.white,
          }}
        >
          {seriesNumber}
        </div>
      )}

      {/* 상단 — 카테고리 라벨 + 페이지 번호 */}
      <header
        className="absolute top-0 left-0 right-0 flex justify-between items-center"
        style={{ padding: "84px 88px 0" }}
      >
        <span
          className="text-[28px] tracking-[0.18em] uppercase"
          style={{ fontWeight: 700, opacity: 0.95 }}
        >
          {categoryLabel}
        </span>
        <span
          className="text-[28px] tabular-nums"
          style={{ fontWeight: 500, opacity: 0.75 }}
        >
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(total).padStart(2, "0")}
        </span>
      </header>

      {/* 본문 — 중앙 정렬, 타이포 위주 */}
      <main
        className="absolute inset-0 flex flex-col justify-center"
        style={{ padding: "0 88px" }}
      >
        {/* 시리즈 라벨 (작은 텍스트 + 흰선) */}
        <div
          className="flex items-center gap-4 mb-10"
          style={{ opacity: 0.85 }}
        >
          <div
            className="h-[3px] w-[60px]"
            style={{ backgroundColor: SoyoColors.white }}
          />
          <span
            className="text-[28px] tracking-[0.16em] uppercase"
            style={{ fontWeight: 600 }}
          >
            {seriesLabel}
          </span>
        </div>

        {/* 헤드라인 — 최대 크기, 화면의 주인공 */}
        <h1
          className="whitespace-pre-line"
          style={{
            fontSize: "168px",
            lineHeight: 1.0,
            letterSpacing: "-0.045em",
            fontWeight: 900,
            color: SoyoColors.white,
          }}
        >
          {card.headline}
        </h1>

        {/* body — 후크 부연 설명 */}
        {card.body && (
          <p
            className="mt-12 whitespace-pre-line"
            style={{
              fontSize: "42px",
              lineHeight: 1.45,
              fontWeight: 400,
              opacity: 0.92,
              maxWidth: 820,
            }}
          >
            {card.body}
          </p>
        )}
      </main>

      {/* 하단 — 핸들 (인스타 신원) */}
      <footer
        className="absolute bottom-0 left-0 right-0 flex items-center gap-3"
        style={{
          padding: "0 88px 88px",
          fontSize: "26px",
          fontWeight: 500,
          opacity: 0.85,
        }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: SoyoColors.white }}
        />
        <span>{handle}</span>
      </footer>
    </div>
  );
}
