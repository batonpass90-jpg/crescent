import type { CardNewsContent } from "@/lib/content-types";
import { OptionBCover } from "./OptionBCover";

interface Props {
  content: CardNewsContent;
  variant: "minimal" | "editorial" | "playful";
  caption?: string;
}

export function InstagramMockup({ content, variant, caption }: Props) {
  const captionText = caption ?? content.caption;
  const tagsLine = content.hashtags.join(" ");

  return (
    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden max-w-[400px] w-full shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
          <div className="w-full h-full rounded-full bg-white p-[1px]">
            <div className="w-full h-full rounded-full bg-neutral-200" />
          </div>
        </div>
        <div className="text-sm font-semibold">자취식단</div>
        <div className="ml-auto text-neutral-400 text-xl leading-none">···</div>
      </div>

      <div className="aspect-[4/5] w-full overflow-hidden bg-neutral-100">
        <div className="w-[1080px] h-[1350px] origin-top-left scale-[0.37]">
          <OptionBCover content={content} variant={variant} />
        </div>
      </div>

      <div className="px-4 py-3 flex items-center gap-4 text-2xl text-neutral-800">
        <span>♡</span>
        <span>💬</span>
        <span>↗</span>
        <span className="ml-auto">⊟</span>
      </div>

      <div className="px-4 pb-4 text-sm leading-relaxed">
        <div className="font-semibold mb-1">좋아요 1,247개</div>
        <div className="whitespace-pre-line text-neutral-800">
          <span className="font-semibold">자취식단</span>{" "}
          {captionText}
        </div>
        <div className="mt-2 text-blue-900 break-words">{tagsLine}</div>
        <div className="mt-2 text-neutral-400 text-xs uppercase tracking-wider">
          5월 6일
        </div>
      </div>
    </div>
  );
}
