import type { CardContent as Card } from "@/lib/content-types";
import { SoyoColors } from "@/lib/soyo-tokens";

export interface CardContentProps {
  card: Card;
  index: number;
  total: number;
  categoryLabel: string;
  bandColor: string;
  handle: string;
}

// 소요 앱 paper2와 통일 (recipe-detail의 section bg와 동일한 톤)
const BG = SoyoColors.paper2;
const PAPER_TEXTURE =
  "radial-gradient(circle at 22% 18%, rgba(0,0,0,0.035) 0px, transparent 1.5px), radial-gradient(circle at 68% 55%, rgba(0,0,0,0.025) 0px, transparent 1px), radial-gradient(circle at 42% 82%, rgba(0,0,0,0.03) 0px, transparent 1.2px)";

const TEXT_PRIMARY = SoyoColors.ink;
const TEXT_BODY = SoyoColors.ink2;
const TEXT_MUTED = SoyoColors.ink3;

export function CardContent({
  card,
  index,
  total,
  categoryLabel,
  bandColor,
  handle,
}: CardContentProps) {
  return (
    <div
      className="relative w-full h-full flex flex-col"
      style={{
        backgroundColor: BG,
        backgroundImage: PAPER_TEXTURE,
        backgroundSize: "8px 8px, 12px 12px, 6px 6px",
        color: TEXT_PRIMARY,
        padding: "84px 96px",
      }}
    >
      <header
        className="flex justify-between items-center text-[28px]"
        style={{ color: TEXT_MUTED, fontWeight: 500 }}
      >
        <span className="tracking-[0.2em] uppercase">{categoryLabel}</span>
        <span className="tabular-nums">
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(total).padStart(2, "0")}
        </span>
      </header>

      <main className="flex-1 flex flex-col justify-start pt-24 overflow-hidden min-h-0">
        {card.subtitle && (
          <div
            className="text-[32px] tracking-[0.16em] uppercase mb-6"
            style={{ color: bandColor, fontWeight: 600 }}
          >
            {card.subtitle}
          </div>
        )}

        <h2
          className="whitespace-pre-line"
          style={{
            fontSize: "112px",
            lineHeight: 1.02,
            letterSpacing: "-0.045em",
            fontWeight: 900,
            color: TEXT_PRIMARY,
          }}
        >
          {card.headline}
        </h2>

        {card.body && (
          <p
            className="mt-12 whitespace-pre-line"
            style={{
              fontSize: "44px",
              lineHeight: 1.55,
              fontWeight: 400,
              color: TEXT_BODY,
              maxWidth: 820,
            }}
          >
            {card.body}
          </p>
        )}

        {card.steps && card.steps.length > 0 && (
          <ol className="mt-16 flex flex-col gap-10">
            {card.steps.map((step, i) => (
              <li key={i} className="flex gap-10 items-baseline">
                <span
                  className="shrink-0 tabular-nums"
                  style={{
                    fontSize: "44px",
                    fontWeight: 700,
                    color: bandColor,
                    minWidth: "70px",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="whitespace-pre-line"
                  style={{
                    fontSize: "40px",
                    lineHeight: 1.45,
                    fontWeight: 400,
                    color: TEXT_PRIMARY,
                  }}
                >
                  {step}
                </span>
              </li>
            ))}
          </ol>
        )}

        {card.rows && card.rows.length > 0 && (
          <dl className="mt-16 flex flex-col gap-9">
            {card.rows.map((row, i) => (
              <div key={i} className="flex gap-12 items-baseline">
                <dt
                  className="shrink-0 tracking-[0.12em] uppercase"
                  style={{
                    fontSize: "26px",
                    fontWeight: 700,
                    color: bandColor,
                    minWidth: "260px",
                  }}
                >
                  {row.label}
                </dt>
                <dd
                  className="whitespace-pre-line"
                  style={{
                    fontSize: "40px",
                    lineHeight: 1.4,
                    fontWeight: 400,
                    color: TEXT_PRIMARY,
                  }}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {card.callout && (
          <div
            className="mt-16 pt-10"
            style={{
              borderTop: `1.5px solid ${withAlpha(bandColor, 0.35)}`,
            }}
          >
            <p
              className="whitespace-pre-line"
              style={{
                fontSize: "36px",
                lineHeight: 1.5,
                fontWeight: 400,
                color: TEXT_BODY,
              }}
            >
              {card.callout.tone === "warn" ? "주의 — " : "팁 — "}
              {card.callout.text}
            </p>
          </div>
        )}
      </main>

      <footer
        className="flex items-center gap-3 text-[26px]"
        style={{ fontWeight: 500, color: TEXT_MUTED }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: bandColor }}
        />
        <span>{handle}</span>
      </footer>
    </div>
  );
}

function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
