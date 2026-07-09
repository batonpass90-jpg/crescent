import { NextRequest, NextResponse } from "next/server";
import { researchProduct } from "@/lib/product-research";
import { upsertProductResearch } from "@/lib/supabase";
import { WorkerError, workerGetJob } from "@/lib/worker";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const job = await workerGetJob(id);

    if (job.status !== "ready") {
      return NextResponse.json(
        { ok: false, error: `이 작업은 아직 상품 조사를 시작할 수 없습니다 (현재: ${job.status}).` },
        { status: 409 }
      );
    }

    const research = await researchProduct(job.product_name);
    await upsertProductResearch(id, research);

    if (research.insufficient_data) {
      return NextResponse.json({
        ok: true,
        research,
        warning: "웹 검색으로 검증 가능한 정보를 충분히 찾지 못했습니다. 대본에는 확인된 정보만 반영됩니다.",
      });
    }

    return NextResponse.json({ ok: true, research });
  } catch (e) {
    const status = e instanceof WorkerError ? e.status : 502;
    const message = e instanceof Error ? e.message : "상품 조사에 실패했습니다.";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
