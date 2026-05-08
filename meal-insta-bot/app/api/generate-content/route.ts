import { NextResponse } from "next/server";
import { generateContent } from "@/lib/content-generator";
import type { ContentCategory } from "@/lib/content-types";

export const runtime = "nodejs";
export const maxDuration = 60;

const VALID_CATEGORIES: ContentCategory[] = [
  "weekly_menu",
  "diet_info",
  "today_meal",
];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { category, date } = (body ?? {}) as {
    category?: string;
    date?: string;
  };

  if (!category || !VALID_CATEGORIES.includes(category as ContentCategory)) {
    return NextResponse.json(
      {
        error: "category must be one of: " + VALID_CATEGORIES.join(", "),
      },
      { status: 400 },
    );
  }
  if (!date || !ISO_DATE.test(date)) {
    return NextResponse.json(
      { error: "date must be in YYYY-MM-DD format" },
      { status: 400 },
    );
  }

  try {
    const result = await generateContent(category as ContentCategory, date);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[generate-content] failed:", message);
    return NextResponse.json(
      { error: "Content generation failed", detail: message },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/generate-content",
    body: {
      category: VALID_CATEGORIES,
      date: "YYYY-MM-DD",
    },
  });
}
