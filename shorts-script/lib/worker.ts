import type { HighlightCandidate, WorkerJob } from "@/lib/types";

export class WorkerError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function workerBaseUrl(): string {
  const url = process.env.WORKER_BASE_URL;
  if (!url) throw new Error("WORKER_BASE_URL 환경변수가 설정되지 않았습니다.");
  return url.replace(/\/$/, "");
}

function workerHeaders(extra?: Record<string, string>): HeadersInit {
  const secret = process.env.WORKER_API_SECRET;
  if (!secret) throw new Error("WORKER_API_SECRET 환경변수가 설정되지 않았습니다.");
  return { "X-Worker-Secret": secret, ...extra };
}

async function safeJson(res: Response): Promise<{ detail?: string } | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/** 링크(URL) 입력은 페이로드가 작아 Next.js를 거쳐 워커로 전달한다. */
export async function workerCreateJobFromUrl(
  productName: string,
  sourceUrl: string
): Promise<{ job_id: string; status: string }> {
  const form = new FormData();
  form.set("product_name", productName);
  form.set("source_url", sourceUrl);

  const res = await fetch(`${workerBaseUrl()}/jobs`, {
    method: "POST",
    headers: workerHeaders(),
    body: form,
  });
  if (!res.ok) {
    const detail = await safeJson(res);
    throw new WorkerError(res.status, detail?.detail ?? "워커 요청에 실패했습니다.");
  }
  return res.json();
}

export async function workerGetJob(jobId: string): Promise<WorkerJob> {
  const res = await fetch(`${workerBaseUrl()}/jobs/${jobId}`, {
    headers: workerHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await safeJson(res);
    throw new WorkerError(res.status, detail?.detail ?? "작업 조회에 실패했습니다.");
  }
  return res.json();
}

export async function workerSetHighlightCandidates(
  jobId: string,
  candidates: HighlightCandidate[]
): Promise<WorkerJob> {
  const res = await fetch(`${workerBaseUrl()}/jobs/${jobId}/highlight-candidates`, {
    method: "PUT",
    headers: workerHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ candidates }),
  });
  if (!res.ok) {
    const detail = await safeJson(res);
    throw new WorkerError(res.status, detail?.detail ?? "하이라이트 후보 저장에 실패했습니다.");
  }
  return res.json();
}

export async function workerSelectHighlight(
  jobId: string,
  startSec: number,
  endSec: number
): Promise<{ job_id: string; status: string }> {
  const res = await fetch(`${workerBaseUrl()}/jobs/${jobId}/highlight`, {
    method: "POST",
    headers: workerHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ start_sec: startSec, end_sec: endSec }),
  });
  if (!res.ok) {
    const detail = await safeJson(res);
    throw new WorkerError(res.status, detail?.detail ?? "하이라이트 확정에 실패했습니다.");
  }
  return res.json();
}
