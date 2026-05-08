import type { CardContent } from "@/lib/content-types";

export interface CardTemplateMastheadProps {
  card: CardContent;
  index: number;
  total: number;
  categoryLabel: string;
  bandColor: string;
  handle: string;
}

const BAND_HEIGHT = 340;

export function CardTemplateMasthead({
  card,
  index,
  total,
  categoryLabel,
  bandColor,
  handle,
}: CardTemplateMastheadProps) {
  const isCover = index === 0;

  return (
    <div
      className="relative w-full h-full flex flex-col"
      style={{ backgroundColor: "#FAF6EE", color: "#1F1A14" }}
    >
      <div
        className="flex justify-between items-center"
        style={{
          height: BAND_HEIGHT,
          backgroundColor: bandColor,
          color: "#FAF6EE",
          padding: "0 88px",
        }}
      >
        <span className="text-[40px] font-bold tracking-wider">
          {categoryLabel}
        </span>
        <span className="text-[32px] tabular-nums font-medium opacity-85">
          {index + 1} / {total}
        </span>
      </div>

      <main
        className="flex-1 flex flex-col justify-center gap-14"
        style={{ padding: "72px 88px" }}
      >
        <h2
          className="font-black tracking-tight"
          style={{
            fontSize: isCover ? "144px" : "104px",
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
          }}
        >
          {card.headline}
        </h2>

        <div
          className="font-medium whitespace-pre-line"
          style={{
            fontSize: "48px",
            lineHeight: 1.55,
            color: "#3A3128",
          }}
        >
          {card.body}
        </div>
      </main>

      <footer
        className="flex items-end text-[28px]"
        style={{ padding: "0 88px 88px" }}
      >
        <span className="font-bold">{handle}</span>
      </footer>
    </div>
  );
}
