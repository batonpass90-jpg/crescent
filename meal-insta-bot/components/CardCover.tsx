import type { CardContent } from "@/lib/content-types";

export interface CardCoverProps {
  card: CardContent;
  index: number;
  total: number;
  categoryLabel: string;
  bandColor: string;
  handle: string;
  photoUrl: string;
}

export function CardCover({
  card,
  index,
  total,
  categoryLabel,
  bandColor,
  handle,
  photoUrl,
}: CardCoverProps) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <img
        src={photoUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.45) 80%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      <header
        className="absolute top-0 left-0 right-0 flex justify-between items-center"
        style={{ padding: "76px 88px 0", color: "#FFFFFF" }}
      >
        <span
          className="px-6 py-3 text-[28px] tracking-[0.16em] uppercase"
          style={{
            fontWeight: 700,
            backgroundColor: bandColor,
            color: "#FFFFFF",
            letterSpacing: "0.16em",
          }}
        >
          {categoryLabel}
        </span>
        <span
          className="text-[28px] tabular-nums"
          style={{ fontWeight: 500, opacity: 0.85 }}
        >
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </header>

      <footer
        className="absolute bottom-0 left-0 right-0"
        style={{ padding: "0 88px 100px", color: "#FFFFFF" }}
      >
        {card.subtitle && (
          <div
            className="text-[30px] tracking-[0.18em] uppercase mb-6"
            style={{
              fontWeight: 500,
              opacity: 0.85,
              color: "#FFFFFF",
            }}
          >
            {card.subtitle}
          </div>
        )}
        <h1
          className="whitespace-pre-line"
          style={{
            fontSize: "152px",
            lineHeight: 1.02,
            letterSpacing: "-0.045em",
            fontWeight: 900,
            textShadow: "0 2px 32px rgba(0,0,0,0.3)",
          }}
        >
          {card.headline}
        </h1>
        {card.body && (
          <p
            className="mt-10 whitespace-pre-line"
            style={{
              fontSize: "38px",
              lineHeight: 1.5,
              fontWeight: 400,
              opacity: 0.92,
              maxWidth: 800,
              textShadow: "0 1px 16px rgba(0,0,0,0.4)",
            }}
          >
            {card.body}
          </p>
        )}
        <div
          className="mt-12 flex items-center gap-3 text-[26px]"
          style={{ fontWeight: 500, opacity: 0.7 }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: bandColor }}
          />
          <span>{handle}</span>
        </div>
      </footer>
    </div>
  );
}
