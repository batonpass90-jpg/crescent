import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { GeneratedScript, ProductResearch, WorkerJob } from "@/lib/types";

let client: SupabaseClient | null = null;

/** 서버(Next.js API 라우트) 전용 클라이언트 — service role 키를 쓰므로 절대 클라이언트 컴포넌트에서 import하지 말 것. */
function getSupabase(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다.");
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

/** worker의 job 스냅샷을 이력 조회용으로 Supabase에 미러링한다 (실패해도 메인 흐름을 막지 않는다). */
export async function upsertJobSnapshot(job: WorkerJob): Promise<void> {
  try {
    const { error } = await getSupabase()
      .from("jobs")
      .upsert(
        {
          id: job.id,
          product_name: job.product_name,
          source_type: job.source_type,
          source_url: job.source_url,
          status: job.status,
          duration_sec: job.duration_sec,
          is_longform: job.is_longform,
          language: job.language,
          error_message: job.error_message,
          selected_highlight: job.selected_highlight,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    if (error) console.error("[supabase] job snapshot upsert 실패:", error.message);
  } catch (e) {
    console.error("[supabase] job snapshot upsert 예외:", e);
  }
}

export async function upsertProductResearch(jobId: string, research: ProductResearch): Promise<void> {
  try {
    const { error } = await getSupabase()
      .from("product_research")
      .upsert(
        {
          job_id: jobId,
          problem_solved: research.problem_solved,
          selling_points: research.selling_points,
          review_keywords: research.review_keywords,
          verified_numbers: research.verified_numbers,
          sources: research.sources,
          insufficient_data: research.insufficient_data,
        },
        { onConflict: "job_id" }
      );
    if (error) console.error("[supabase] product_research upsert 실패:", error.message);
  } catch (e) {
    console.error("[supabase] product_research upsert 예외:", e);
  }
}

export async function upsertScript(jobId: string, script: GeneratedScript): Promise<void> {
  try {
    const { error } = await getSupabase()
      .from("scripts")
      .upsert(
        {
          job_id: jobId,
          hook_line: script.hook_line,
          script_rows: script.script_rows,
          estimated_runtime_sec: script.estimated_runtime_sec,
          bgm_note: script.bgm_note,
        },
        { onConflict: "job_id" }
      );
    if (error) console.error("[supabase] script upsert 실패:", error.message);
  } catch (e) {
    console.error("[supabase] script upsert 예외:", e);
  }
}

export interface HistoryItem {
  id: string;
  product_name: string;
  status: string;
  is_longform: boolean | null;
  created_at: string;
  has_script: boolean;
}

export async function listHistory(limit = 50): Promise<HistoryItem[]> {
  const { data, error } = await getSupabase()
    .from("jobs")
    .select("id, product_name, status, is_longform, created_at, scripts(job_id)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[supabase] history 조회 실패:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    product_name: row.product_name,
    status: row.status,
    is_longform: row.is_longform,
    created_at: row.created_at,
    has_script: Array.isArray(row.scripts) && row.scripts.length > 0,
  }));
}
