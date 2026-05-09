import Link from "next/link";
import { RECIPES, photoFor } from "@/lib/recipe-source";
import { WEEKLY_MENUS } from "@/lib/weekly-menus";
import { DIET_INFOS } from "@/lib/diet-infos";
import { LIFESTYLE_POSTS } from "@/lib/lifestyle-posts";
import { HACK_POSTS } from "@/lib/hack-posts";
import { SoyoColors } from "@/lib/soyo-tokens";

interface BlogIndexProps {
  searchParams: Promise<{ category?: string }>;
}

interface PostCard {
  type: "recipe" | "weekly" | "diet" | "lifestyle" | "hack";
  id: string;
  title: string;
  description: string;
  meta: string;
  href: string;
  tagLabel: string;
  tagColor: string;
  imageUrl?: string;
}

function buildPostList(): PostCard[] {
  const recipes: PostCard[] = RECIPES.map((r) => ({
    type: "recipe",
    id: r.id,
    title: r.name,
    description: r.tip ?? `${r.category} · ${r.time}분 · ${r.kcal}kcal`,
    meta: `${r.time}분 · ${r.kcal}kcal · ${r.difficulty}`,
    href: `/blog/recipe/${r.id}`,
    tagLabel: r.category,
    tagColor: SoyoColors.clay,
    imageUrl: photoFor(r),
  }));

  const weeklies: PostCard[] = WEEKLY_MENUS.map((m) => ({
    type: "weekly",
    id: m.id,
    title: `${m.theme} 일주일 식단표`,
    description: m.description,
    meta: m.budget,
    href: `/blog/weekly/${m.id}`,
    tagLabel: "식단표",
    tagColor: SoyoColors.sage,
  }));

  const diets: PostCard[] = DIET_INFOS.map((d) => ({
    type: "diet",
    id: d.id,
    title: d.topic.replace(/\n/g, " "),
    description: d.hookBody.replace(/\n/g, " "),
    meta: d.hookSubtitle,
    href: `/blog/diet/${d.id}`,
    tagLabel: "영양정보",
    tagColor: SoyoColors.sky,
  }));

  const lifestyles: PostCard[] = LIFESTYLE_POSTS.map((p) => ({
    type: "lifestyle",
    id: p.id,
    title: p.topic.replace(/\n/g, " "),
    description: p.hookBody.replace(/\n/g, " "),
    meta: p.hookSubtitle,
    href: `/blog/lifestyle/${p.id}`,
    tagLabel: "라이프",
    tagColor: SoyoColors.purple,
  }));

  const hacks: PostCard[] = HACK_POSTS.map((h) => ({
    type: "hack",
    id: h.id,
    title: h.topic.replace(/\n/g, " "),
    description: h.hookBody.replace(/\n/g, " "),
    meta: h.hookSubtitle,
    href: `/blog/hack/${h.id}`,
    tagLabel: "꿀팁",
    tagColor: SoyoColors.gold,
  }));

  return [...recipes, ...weeklies, ...diets, ...lifestyles, ...hacks];
}

export default async function BlogIndex({ searchParams }: BlogIndexProps) {
  const params = await searchParams;
  const category = params.category;

  const allPosts = buildPostList();
  const posts =
    category && ["recipe", "weekly", "diet", "lifestyle", "hack"].includes(category)
      ? allPosts.filter((p) => p.type === category)
      : allPosts;

  const categoryLabel: Record<string, string> = {
    recipe: "한 끼 레시피",
    weekly: "주간 식단표",
    diet: "영양 정보",
    lifestyle: "자취 라이프",
    hack: "자취 꿀팁",
  };

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2">
          {category ? categoryLabel[category] ?? "전체 글" : "전체 글"}
        </h1>
        <p style={{ color: SoyoColors.ink3 }}>
          {posts.length}개 — 자취 5년차의 검증된 한 끼·식단·영양 가이드
        </p>
      </header>

      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={`${post.type}-${post.id}`}>
            <Link
              href={post.href}
              className="block group rounded-xl overflow-hidden border transition hover:shadow-md"
              style={{
                borderColor: SoyoColors.paper3,
                backgroundColor: SoyoColors.paper2,
              }}
            >
              <div className="flex gap-4 p-4">
                {post.imageUrl && (
                  <div
                    className="shrink-0 w-24 h-24 rounded-lg overflow-hidden"
                    style={{ backgroundColor: SoyoColors.paper3 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{
                        color: post.tagColor,
                        backgroundColor: `${post.tagColor}15`,
                      }}
                    >
                      {post.tagLabel}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: SoyoColors.ink3 }}
                    >
                      {post.meta}
                    </span>
                  </div>
                  <h2
                    className="text-lg font-bold mb-1 group-hover:underline truncate"
                    style={{ color: SoyoColors.ink }}
                  >
                    {post.title}
                  </h2>
                  <p
                    className="text-sm line-clamp-2"
                    style={{ color: SoyoColors.ink2 }}
                  >
                    {post.description}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
