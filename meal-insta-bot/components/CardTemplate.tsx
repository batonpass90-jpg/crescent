import type { CardContent } from "@/lib/content-types";

export interface CardTemplateProps {
  card: CardContent;
  index: number;
  total: number;
  categoryLabel: string;
  handle: string;
}

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;

export function CardTemplate({
  card,
  index,
  total,
  categoryLabel,
  handle,
}: CardTemplateProps) {
  const isCover = index === 0;

  return (
    <div
      className="relative w-full h-full flex flex-col"
      style={{
        backgroundColor: "#FAF6EE",
        color: "#1F1A14",
        padding: "96px 88px",
      }}
    >
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: "#C2502A" }}
          />
          <span className="text-[30px] font-bold tracking-wider">
            {categoryLabel}
          </span>
        </div>
        <span className="text-[28px] tabular-nums font-medium opacity-50">
          {index + 1} / {total}
        </span>
      </header>

      <main className="flex-1 flex flex-col justify-center gap-14">
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

      <footer className="flex items-end text-[28px]">
        <span className="font-bold">{handle}</span>
      </footer>
    </div>
  );
}
