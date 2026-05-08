import type { CardNewsContent } from "@/lib/content-types";

interface Props {
  content: CardNewsContent;
}

export function ThreadsMockup({ content }: Props) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 max-w-[500px] w-full shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-neutral-200 shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">자취식단</span>
            <span className="text-neutral-400 text-sm">· 1시간</span>
            <span className="ml-auto text-neutral-400 text-xl leading-none">···</span>
          </div>

          <div className="mt-2 text-[15px] leading-[1.55] text-neutral-900 whitespace-pre-line">
            <span className="font-semibold">{content.title}</span>
            {"\n\n"}
            {content.caption}
            {"\n\n"}
            <span className="text-blue-700">{content.hashtags.join(" ")}</span>
          </div>

          <div className="mt-4 flex items-center gap-6 text-neutral-500 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="text-lg">♡</span> 312
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-lg">💬</span> 41
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-lg">⟲</span> 18
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-lg">↗</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
