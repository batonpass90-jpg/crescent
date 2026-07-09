import { NextRequest, NextResponse } from "next/server";
import { scoreHighlightCandidates } from "@/lib/highlight";
import { WorkerError, workerGetJob, workerSetHighlightCandidates } from "@/lib/worker";

export const runtime = "nodejs";
export const maxDuration = 60;

/** 워커의 STT 결과를 받아 Haiku로 하이라이트 후보를 점수화하고, 워커에 다시 저장한다. */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const job = await workerGetJob(id);

    if (job.status !== "awaiting_highlight_selection") {
      return NextResponse.json(
        { ok: false, error: `이 작업은 하이라이트 후보를 만들 상태가 아닙니다 (현재: ${job.status}).` },
        { status: 409 }
      );
    }
    if (job.highlight_candidates && job.highlight_candidates.length > 0) {
      return NextResponse.json({ ok: true, candidates: job.highlight_candidates });
    }

    const segments = job.transcript_segments ?? [];
    const candidates = await scoreHighlightCandidates(segments, job.product_name);

    if (candidates.length === 0) {
      return NextResponse.json(
        { ok: false, error: "인식된 발화가 없어 하이라이트 후보를 만들 수 없습니다. 구간을 직접 선택해 주세요." },
        { status: 422 }
      );
    }

    await workerSetHighlightCandidates(id, candidates);
    return NextResponse.json({ ok: true, candidates });
  } catch (e) {
    const status = e instanceof WorkerError ? e.status : 502;
    const message = e instanceof Error ? e.message : "하이라이트 후보 생성에 실패했습니다.";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
