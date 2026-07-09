import { NextRequest, NextResponse } from "next/server";
import { WorkerError, workerCreateJobFromUrl } from "@/lib/worker";

export const runtime = "nodejs";

/**
 * 링크(URL) 입력 전용. 파일 업로드는 Vercel을 거치지 않고
 * 브라우저가 워커 서버에 직접 보낸다 (NEXT_PUBLIC_WORKER_BASE_URL 참고).
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const productName = body?.product_name;
  const sourceUrl = body?.source_url;

  if (typeof productName !== "string" || !productName.trim()) {
    return NextResponse.json({ ok: false, error: "상품명을 입력해 주세요." }, { status: 400 });
  }
  if (typeof sourceUrl !== "string" || !sourceUrl.trim()) {
    return NextResponse.json({ ok: false, error: "영상 링크를 입력해 주세요." }, { status: 400 });
  }

  try {
    const result = await workerCreateJobFromUrl(productName.trim(), sourceUrl.trim());
    return NextResponse.json({ ok: true, job_id: result.job_id });
  } catch (e) {
    const status = e instanceof WorkerError ? e.status : 502;
    const message = e instanceof Error ? e.message : "요청 처리 중 오류가 발생했습니다.";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
