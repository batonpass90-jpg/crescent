import { NextRequest, NextResponse } from "next/server";
import { generateScript, summarizeScenes } from "@/lib/script";
import { upsertScript } from "@/lib/supabase";
import { summarizeTranscript } from "@/lib/transcript-summary";
import type { GeneratedScript, ProductResearch } from "@/lib/types";
import { WorkerError, workerGetJob } from "@/lib/worker";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const research = body?.research as ProductResearch | undefined;
  const feedback = typeof body?.feedback === "string" && body.feedback.trim() ? body.feedback.trim() : undefined;
  const previousScript = body?.previous_script as GeneratedScript | undefined;

  if (!research) {
    return NextResponse.json(
      { ok: false, error: "상품 조사 결과가 필요합니다. 먼저 상품 조사를 완료해 주세요." },
      { status: 400 }
    );
  }

  try {
    const job = await workerGetJob(id);
    if (job.status !== "ready") {
      return NextResponse.json(
        { ok: false, error: `이 작업은 아직 대본을 생성할 수 없습니다 (현재: ${job.status}).` },
        { status: 409 }
      );
    }

    const transcriptSummary = await summarizeTranscript(job.transcript_segments ?? [], job.language);
    const scenesSummary = summarizeScenes(job.scenes);

    const durationSec = job.selected_highlight
      ? job.selected_highlight.end_sec - job.selected_highlight.start_sec
      : job.duration_sec ?? 30;

    const script = await generateScript({
      productName: job.product_name,
      research,
      transcriptSummary,
      scenesSummary,
      durationSec,
      feedback,
      previousScript,
    });

    await upsertScript(id, script);

    return NextResponse.json({ ok: true, script, transcript_summary: transcriptSummary });
  } catch (e) {
    const status = e instanceof WorkerError ? e.status : 502;
    const message = e instanceof Error ? e.message : "대본 생성에 실패했습니다.";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
