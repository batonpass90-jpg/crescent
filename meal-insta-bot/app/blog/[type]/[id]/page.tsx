/**
 * 블로그 상세 페이지 — recipe / weekly / diet 한 페이지에서 처리.
 *
 * /blog/recipe/9   → 김치볶음밥
 * /blog/weekly/1   → 단백질 위주 식단표
 * /blog/diet/1     → 단백질, 얼마나?
 *
 * generateStaticParams로 빌드 타임에 모든 페이지 정적 생성 → SEO·속도 최적.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RECIPES, findRecipe, photoFor } from "@/lib/recipe-source";
import { WEEKLY_MENUS, findWeeklyMenu } from "@/lib/weekly-menus";
import { DIET_INFOS, findDietInfo } from "@/lib/diet-infos";
import { LIFESTYLE_POSTS, findLifestylePost } from "@/lib/lifestyle-posts";
import { HACK_POSTS, findHackPost } from "@/lib/hack-posts";
import { SoyoColors, SoyoLinks } from "@/lib/soyo-tokens";

interface Params {
  type: string;
  id: string;
}

interface PageProps {
  params: Promise<Params>;
}

const WEEKLY_PHOTO =
  "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1080&h=720&fit=crop";
const DIET_PHOTO =
  "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1080&h=720&fit=crop";

// ── Static Params (빌드 타임에 모든 경로 생성) ─────────────
export async function generateStaticParams(): Promise<Params[]> {
  return [
    ...RECIPES.map((r) => ({ type: "recipe", id: r.id })),
    ...WEEKLY_MENUS.map((m) => ({ type: "weekly", id: m.id })),
    ...DIET_INFOS.map((d) => ({ type: "diet", id: d.id })),
    ...LIFESTYLE_POSTS.map((p) => ({ type: "lifestyle", id: p.id })),
    ...HACK_POSTS.map((h) => ({ type: "hack", id: h.id })),
  ];
}

// ── 메타 데이터 (SEO) ──────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type, id } = await params;

  if (type === "recipe") {
    const r = findRecipe(id);
    if (!r) return {};
    const desc = `${r.name} 만드는 법 — ${r.time}분, ${r.kcal}kcal, ${r.difficulty}. 자취 5년차의 검증된 ${r.category} 한 끼.`;
    return {
      title: `${r.name} 레시피`,
      description: desc,
      openGraph: { title: r.name, description: desc, images: [photoFor(r)] },
    };
  }
  if (type === "weekly") {
    const m = findWeeklyMenu(id);
    if (!m) return {};
    const desc = `${m.theme} — ${m.description}. 주간 장보기 ${m.budget}.`;
    return {
      title: `${m.theme} 일주일 식단표`,
      description: desc,
      openGraph: { title: m.theme, description: desc, images: [WEEKLY_PHOTO] },
    };
  }
  if (type === "diet") {
    const d = findDietInfo(id);
    if (!d) return {};
    const topic = d.topic.replace(/\n/g, " ");
    return {
      title: topic,
      description: d.hookBody.replace(/\n/g, " "),
      openGraph: { title: topic, description: d.hookBody, images: [DIET_PHOTO] },
    };
  }
  if (type === "lifestyle") {
    const p = findLifestylePost(id);
    if (!p) return {};
    const topic = p.topic.replace(/\n/g, " ");
    return {
      title: topic,
      description: p.hookBody.replace(/\n/g, " "),
      openGraph: { title: topic, description: p.hookBody, images: [DIET_PHOTO] },
    };
  }
  if (type === "hack") {
    const h = findHackPost(id);
    if (!h) return {};
    const topic = h.topic.replace(/\n/g, " ");
    return {
      title: topic,
      description: h.hookBody.replace(/\n/g, " "),
      openGraph: { title: topic, description: h.hookBody, images: [WEEKLY_PHOTO] },
    };
  }
  return {};
}

// ── 페이지 본문 ───────────────────────────────────────────
export default async function BlogDetail({ params }: PageProps) {
  const { type, id } = await params;
  if (type === "recipe") return <RecipePost id={id} />;
  if (type === "weekly") return <WeeklyPost id={id} />;
  if (type === "diet") return <DietPost id={id} />;
  if (type === "lifestyle") return <LifestylePostPage id={id} />;
  if (type === "hack") return <HackPostPage id={id} />;
  notFound();
}

// ── Recipe ────────────────────────────────────────────────
function RecipePost({ id }: { id: string }) {
  const r = findRecipe(id);
  if (!r) notFound();
  const photo = photoFor(r);

  // JSON-LD Recipe Schema (Google Search rich snippet 노출)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: r.name,
    image: [photo],
    description: `자취 5년차의 ${r.name} 레시피 — ${r.time}분, ${r.kcal}kcal.`,
    recipeCategory: r.category,
    recipeCuisine: r.category,
    keywords: ["자취", "한 끼", r.category, r.tag, "1인가구", r.name].join(", "),
    totalTime: `PT${r.time}M`,
    recipeYield: "1인분",
    recipeIngredient: r.ingredients,
    recipeInstructions: r.steps.map((step, i) => ({
      "@type": "HowToStep",
      name: `Step ${i + 1}`,
      text: step,
    })),
    nutrition: {
      "@type": "NutritionInformation",
      calories: `${r.kcal} kcal`,
    },
    author: { "@type": "Organization", name: "소요" },
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Hero
        photo={photo}
        category={r.category}
        title={r.name}
        meta={`${r.time}분 · ${r.kcal}kcal · ${r.difficulty}`}
        intro={r.tip ?? `자취 5년차의 검증된 ${r.category} 한 끼.`}
      />

      <Section title="재료 (1인분)">
        <ul className="space-y-2">
          {r.ingredients.map((ing, i) => (
            <li key={i} className="flex gap-3">
              <span style={{ color: SoyoColors.clay }}>·</span>
              <span>{ing}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="만드는 법">
        <ol className="space-y-3">
          {r.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold tabular-nums"
                style={{
                  backgroundColor: SoyoColors.clay,
                  color: SoyoColors.white,
                }}
              >
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </Section>

      {r.tip && (
        <Section title="자취 팁">
          <Callout tone="tip">{r.tip}</Callout>
        </Section>
      )}

      <Section title="영양 정보">
        <table className="w-full text-sm">
          <tbody>
            <Row k="칼로리" v={`약 ${r.kcal} kcal`} />
            <Row k="조리시간" v={`${r.time}분`} />
            <Row k="난이도" v={r.difficulty} />
            <Row k="카테고리" v={r.category} />
          </tbody>
        </table>
      </Section>

      <SoyoCTA />
    </article>
  );
}

// ── Weekly Menu ───────────────────────────────────────────
function WeeklyPost({ id }: { id: string }) {
  const m = findWeeklyMenu(id);
  if (!m) notFound();

  return (
    <article>
      <Hero
        photo={WEEKLY_PHOTO}
        category="식단표"
        title={`${m.theme} 일주일 식단표`}
        meta={m.budget}
        intro={m.description}
      />

      <Section title="평일 식단">
        <table className="w-full text-sm">
          <tbody>
            {m.weekdays.map((d) => (
              <Row key={d.day} k={d.day} v={d.meal} />
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="주말 식단">
        <table className="w-full text-sm">
          <tbody>
            {m.weekend.map((d) => (
              <Row key={d.day} k={d.day} v={d.meal} />
            ))}
          </tbody>
        </table>
        {m.weekendNote && (
          <div className="mt-4">
            <Callout tone="tip">{m.weekendNote}</Callout>
          </div>
        )}
      </Section>

      <Section title={`장보기 (${m.budget})`}>
        <table className="w-full text-sm">
          <tbody>
            {m.shopping.map((s, i) => (
              <Row key={i} k={s.item} v={s.price} />
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="보관 팁">
        <Callout tone="tip">{m.storageTip}</Callout>
      </Section>

      <SoyoCTA />
    </article>
  );
}

// ── Diet Info ─────────────────────────────────────────────
function DietPost({ id }: { id: string }) {
  const d = findDietInfo(id);
  if (!d) notFound();

  return (
    <article>
      <Hero
        photo={DIET_PHOTO}
        category="영양정보"
        title={d.topic.replace(/\n/g, " ")}
        meta={d.hookSubtitle}
        intro={d.hookBody}
      />

      <Section title={d.criteria.title}>
        <table className="w-full text-sm">
          <tbody>
            {d.criteria.rows.map((row, i) => (
              <Row key={i} k={row.label} v={row.value} />
            ))}
          </tbody>
        </table>
      </Section>

      <Section title={d.sources.title}>
        <table className="w-full text-sm">
          <tbody>
            {d.sources.rows.map((row, i) => (
              <Row key={i} k={row.label} v={row.value} />
            ))}
          </tbody>
        </table>
      </Section>

      <Section title={d.application.title}>
        <table className="w-full text-sm">
          <tbody>
            {d.application.rows.map((row, i) => (
              <Row key={i} k={row.label} v={row.value} />
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="흔한 실수">
        <Callout tone="warn">{d.mistakeCallout}</Callout>
      </Section>

      <Section title="결론">
        <Callout tone="tip">{d.conclusion}</Callout>
      </Section>

      <SoyoCTA />
    </article>
  );
}

// ── Lifestyle (페르소나·공감) ─────────────────────────────
function LifestylePostPage({ id }: { id: string }) {
  const p = findLifestylePost(id);
  if (!p) notFound();
  const photo = DIET_PHOTO;
  return (
    <article>
      <Hero
        photo={photo}
        category="자취 라이프"
        title={p.topic.replace(/\n/g, " ")}
        meta={p.hookSubtitle}
        intro={p.hookBody}
      />
      <Section title={p.intro.title}>
        <table className="w-full text-sm">
          <tbody>
            {p.intro.rows.map((r, i) => (
              <Row key={i} k={r.label} v={r.value} />
            ))}
          </tbody>
        </table>
      </Section>
      {p.types.map((t, i) => (
        <Section key={i} title={t.name}>
          <p className="text-sm mb-3" style={{ color: SoyoColors.ink2 }}>
            <strong>{t.trait}</strong>
          </p>
          <p className="text-sm mb-3" style={{ color: SoyoColors.ink3 }}>
            특징 — {t.habit}
          </p>
          <Callout tone="tip">처방 — {t.prescription}</Callout>
        </Section>
      ))}
      <Section title="결론">
        <Callout tone="tip">{p.conclusion}</Callout>
        <p className="text-sm mt-4" style={{ color: SoyoColors.ink3 }}>
          {p.shareHook}
        </p>
      </Section>
      <SoyoCTA />
    </article>
  );
}

// ── Hack (실용 꿀팁) ─────────────────────────────────────
function HackPostPage({ id }: { id: string }) {
  const h = findHackPost(id);
  if (!h) notFound();
  return (
    <article>
      <Hero
        photo={WEEKLY_PHOTO}
        category="자취 꿀팁"
        title={h.topic.replace(/\n/g, " ")}
        meta={h.hookSubtitle}
        intro={h.hookBody}
      />
      <Section title={h.problem.title}>
        <table className="w-full text-sm">
          <tbody>
            {h.problem.rows.map((r, i) => (
              <Row key={i} k={r.label} v={r.value} />
            ))}
          </tbody>
        </table>
      </Section>
      <Section title="5단계 해결법">
        <ol className="space-y-4">
          {h.steps.map((s, i) => (
            <li key={i}>
              <div className="flex gap-3 items-baseline mb-1">
                <span
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: SoyoColors.clay,
                    color: SoyoColors.white,
                  }}
                >
                  {s.label}
                </span>
                <span className="font-bold" style={{ color: SoyoColors.ink }}>
                  {s.action}
                </span>
              </div>
              <p
                className="ml-10 text-sm"
                style={{ color: SoyoColors.ink2 }}
              >
                {s.detail}
              </p>
            </li>
          ))}
        </ol>
      </Section>
      <Section title={h.example.title}>
        <table className="w-full text-sm">
          <tbody>
            {h.example.rows.map((r, i) => (
              <Row key={i} k={r.label} v={r.value} />
            ))}
          </tbody>
        </table>
      </Section>
      <Section title="저장하세요">
        <Callout tone="tip">{h.saveHook}</Callout>
      </Section>
      <SoyoCTA />
    </article>
  );
}

// ── Sub Components ────────────────────────────────────────

function Hero({
  photo,
  category,
  title,
  meta,
  intro,
}: {
  photo: string;
  category: string;
  title: string;
  meta: string;
  intro: string;
}) {
  return (
    <header className="mb-10">
      <div
        className="aspect-[16/10] rounded-2xl overflow-hidden mb-6"
        style={{ backgroundColor: SoyoColors.paper3 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{
            color: SoyoColors.clay,
            backgroundColor: `${SoyoColors.clay}15`,
          }}
        >
          {category}
        </span>
        <span className="text-xs" style={{ color: SoyoColors.ink3 }}>
          {meta}
        </span>
      </div>
      <h1
        className="text-3xl md:text-4xl font-black tracking-tight mb-4 whitespace-pre-line"
        style={{ color: SoyoColors.ink, letterSpacing: "-0.03em" }}
      >
        {title}
      </h1>
      <p
        className="text-base md:text-lg leading-relaxed whitespace-pre-line"
        style={{ color: SoyoColors.ink2 }}
      >
        {intro}
      </p>
    </header>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2
        className="text-xl font-bold mb-4 pb-2 border-b"
        style={{ color: SoyoColors.ink, borderColor: SoyoColors.paper3 }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <tr className="border-b" style={{ borderColor: SoyoColors.paper3 }}>
      <td
        className="py-2 pr-4 font-bold w-1/3 align-top"
        style={{ color: SoyoColors.clay }}
      >
        {k}
      </td>
      <td
        className="py-2 whitespace-pre-line"
        style={{ color: SoyoColors.ink2 }}
      >
        {v}
      </td>
    </tr>
  );
}

function Callout({
  tone,
  children,
}: {
  tone: "tip" | "warn";
  children: React.ReactNode;
}) {
  const color = tone === "warn" ? SoyoColors.clay : SoyoColors.sage;
  const bg = tone === "warn" ? SoyoColors.clayBg : SoyoColors.sageBg;
  return (
    <div
      className="rounded-lg p-4 border-l-4 whitespace-pre-line"
      style={{ borderColor: color, backgroundColor: bg, color: SoyoColors.ink2 }}
    >
      {children}
    </div>
  );
}

function SoyoCTA() {
  return (
    <section
      className="mt-16 p-6 rounded-2xl"
      style={{
        backgroundColor: SoyoColors.goldBg,
        border: `1px solid ${SoyoColors.gold}33`,
      }}
    >
      <h2
        className="text-xl font-bold mb-3"
        style={{ color: SoyoColors.ink }}
      >
        혼자서도 잘 먹기
      </h2>
      <p className="mb-4 text-sm" style={{ color: SoyoColors.ink2 }}>
        매일 먹는 것 — 기록·분석·관리 한 번에. 자취인 식단앱 <strong>소요</strong>.
      </p>
      <ul className="text-sm space-y-2 mb-4" style={{ color: SoyoColors.ink2 }}>
        <li>· <strong>레시피</strong> — 혼자 먹는 한 끼 필요할 때</li>
        <li>· <strong>장보기</strong> — 1인분 장보기 막막할 때</li>
        <li>· <strong>영양분석</strong> — 잘 먹고 있나 궁금할 때</li>
        <li>· <strong>빠른요리</strong> — 귀찮음에 빠른 끼니 필요할 때</li>
      </ul>
      <a
        href={SoyoLinks.recipeDetailWeb("1")}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-5 py-2.5 rounded-lg font-bold text-sm transition hover:opacity-90"
        style={{ backgroundColor: SoyoColors.gold, color: SoyoColors.white }}
      >
        소요 앱 보러가기 →
      </a>
      <p className="text-xs mt-3" style={{ color: SoyoColors.ink3 }}>
        Instagram <Link href="/blog" className="hover:underline">{SoyoLinks.instagramHandle}</Link>도 팔로우 — 매일 11:30·18:00 새 콘텐츠.
      </p>
    </section>
  );
}
