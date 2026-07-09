import { NextRequest, NextResponse } from "next/server";
import { WorkerError, workerSelectHighlight } from "@/lib/worker";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const startSec = Number(body?.start_sec);
  const endSec = Number(body?.end_sec);

  if (!Number.isFinite(startSec) || !Number.isFinite(endSec) || endSec <= startSec) {
    return NextResponse.json({ ok: false, error: "구간 값이 올바르지 않습니다." }, { status: 400 });
  }

  try {
    const result = await workerSelectHighlight(id, startSec, endSec);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const status = e instanceof WorkerError ? e.status : 502;
    const message = e instanceof Error ? e.message : "하이라이트 확정에 실패했습니다.";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
