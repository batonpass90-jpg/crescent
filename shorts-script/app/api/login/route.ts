import { NextRequest, NextResponse } from "next/server";
import { checkTeamPassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));

  if (typeof password !== "string" || !checkTeamPassword(password)) {
    return NextResponse.json({ ok: false, error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
