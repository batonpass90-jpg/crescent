import type { CardNewsContent } from "@/lib/content-types";

interface Props {
  content: CardNewsContent;
  variant: "minimal" | "editorial" | "playful";
}

export function OptionBCover({ content, variant }: Props) {
  if (variant === "minimal") {
    return (
      <div
        className="relative w-full h-full flex flex-col justify-between p-16"
        style={{ backgroundColor: "#FAFAF7", color: "#1A1A1A" }}
      >
        <div className="text-sm tracking-[0.3em] uppercase text-neutral-500">
          오늘의 한 끼
        </div>
        <div>
          <div className="text-[88px] leading-[1.05] font-black tracking-tight">
            {content.title}
          </div>
          <div className="mt-6 h-[3px] w-16 bg-neutral-900" />
          <div className="mt-6 text-2xl text-neutral-600 leading-snug">
            10분 컷, 1구 인덕션 OK
          </div>
        </div>
        <div className="flex justify-between items-end text-sm text-neutral-500">
          <span>2026.05.06 (수)</span>
          <span>@자취식단</span>
        </div>
      </div>
    );
  }

  if (variant === "editorial") {
    return (
      <div
        className="relative w-full h-full flex flex-col p-12"
        style={{ backgroundColor: "#1F2419", color: "#F5F2E8" }}
      >
        <div className="flex justify-between items-start text-xs tracking-widest uppercase opacity-60">
          <span>VOL. 047 · 오늘의 한 끼</span>
          <span>2026.05.06</span>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <div
            className="text-[120px] leading-[0.95] font-black"
            style={{ fontFamily: "Georgia, serif" }}
          >
            김치
            <br />
            볶음밥
          </div>
          <div
            className="mt-8 text-3xl italic opacity-80"
            style={{ fontFamily: "Georgia, serif" }}
          >
            ten-minute monday
          </div>
        </div>
        <div className="text-base opacity-70 leading-relaxed max-w-md">
          묵은김치 처리 + 찬밥 처리. 자취 평일 저녁의 정답.
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full flex flex-col p-14"
      style={{ backgroundColor: "#FFE9DA", color: "#3A1F0F" }}
    >
      <div className="text-2xl">🍳</div>
      <div className="flex-1 flex items-center">
        <div className="text-[96px] leading-[1] font-black tracking-tight">
          오늘은
          <br />
          김치
          <br />
          볶음밥
        </div>
      </div>
      <div
        className="self-start px-4 py-2 rounded-full text-sm font-semibold"
        style={{ backgroundColor: "#3A1F0F", color: "#FFE9DA" }}
      >
        10분 · 1인분 · 묵은김치 처리
      </div>
      <div className="mt-6 text-sm opacity-60">2026.05.06 (수) · @자취식단</div>
    </div>
  );
}
