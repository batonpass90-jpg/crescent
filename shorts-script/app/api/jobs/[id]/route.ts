import { NextRequest, NextResponse } from "next/server";
import { upsertJobSnapshot } from "@/lib/supabase";
import { WorkerError, workerGetJob } from "@/lib/worker";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const job = await workerGetJob(id);
    // 이력 화면에서 팀원들이 다시 볼 수 있도록 조회 시점마다 최신 상태를 미러링한다.
    // Vercel 서버리스는 응답 후 즉시 함수를 정지시킬 수 있으므로 fire-and-forget 대신 await한다.
    await upsertJobSnapshot(job);
    return NextResponse.json({ ok: true, job });
  } catch (e) {
    const status = e instanceof WorkerError ? e.status : 502;
    const message = e instanceof Error ? e.message : "작업 조회에 실패했습니다.";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
