// ================================================================
// Supabase Edge Function: send-daily-report
//
// 매일 19:00 KST에 pg_cron이 호출 → 그날 케어가 있었던 어르신의
// 보호자에게 종합 보고서 1건 발송 (수시 알림 대체)
//
// 발송 채널: send-notification Edge Function 재사용
//   → 푸시 → 알림톡 → SMS 폴백 체인
//
// 배포: supabase functions deploy send-daily-report
// 수동 테스트: 함수 페이지 → Invoke 탭에서 { "date": "2026-04-28" } body로 호출
// ================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

interface ReportRow {
  guardian_id: string;
  guardian_phone: string | null;
  guardian_name: string | null;
  patient_name: string;
  patient_id: string;
  center_id: string;
  center_name: string;
  visit_count: number;
  completed_count: number;
  total_checks: number;
  done_checks: number;
  worker_names: string | null;
  has_photos: boolean;
  memos: string | null;
}

function buildMessage(r: ReportRow, dateStr: string): { title: string; body: string } {
  const completionRate = r.total_checks > 0 ? Math.round((r.done_checks / r.total_checks) * 100) : 0;
  const title = `📋 ${r.patient_name} 어르신 ${dateStr.slice(5)} 케어 보고`;

  let body = `오늘 케어 ${r.completed_count}회 완료\n`;
  body += `✓ 체크리스트 ${r.done_checks}/${r.total_checks} (${completionRate}%)\n`;
  if (r.worker_names) body += `👩‍⚕️ ${r.worker_names} 보호사\n`;
  if (r.has_photos) body += `📷 사진 첨부됨\n`;
  if (r.memos && r.memos.trim()) body += `📝 ${r.memos.slice(0, 80)}${r.memos.length > 80 ? '...' : ''}\n`;
  body += `\n자세히 보기: 보호자 앱`;

  return { title, body };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  // 호출 인증: pg_cron이 service_role로 호출하므로 Bearer 토큰 검증
  // (또는 Supabase가 자동으로 verify_jwt 옵션으로 처리)

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let body: { date?: string } = {};
  try { body = await req.json(); } catch {}
  const targetDate = body.date || new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);  // KST 기준 오늘

  console.log(`[send-daily-report] 발송 시작 — 대상일: ${targetDate}`);

  // 보호자별 데이터 조회 (RPC 함수)
  const { data: rows, error } = await supabase.rpc("get_daily_report_data", { p_date: targetDate });

  if (error) {
    console.error("[send-daily-report] RPC 실패:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
    });
  }

  if (!rows || rows.length === 0) {
    console.log("[send-daily-report] 발송 대상 없음");
    return new Response(JSON.stringify({ delivered: 0, message: "발송 대상 없음" }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
    });
  }

  console.log(`[send-daily-report] 대상자 수: ${rows.length}`);

  const results: Array<{ guardian_id: string; status: string; error?: string }> = [];

  // 각 보호자에게 send-notification 호출 (푸시→알림톡→SMS 폴백)
  for (const r of rows as ReportRow[]) {
    const { title, body: msg } = buildMessage(r, targetDate);

    try {
      const res = await fetch(
        Deno.env.get("SUPABASE_URL")! + "/functions/v1/send-notification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
          },
          body: JSON.stringify({
            type: "daily_report",
            title,
            body: msg,
            recipient_id: r.guardian_id,
            recipient_phone: r.guardian_phone,
            recipient_name: r.guardian_name,
            center_id: r.center_id,
            url: "/care-customer.html"
          })
        }
      );
      const data = await res.json().catch(() => ({}));
      results.push({ guardian_id: r.guardian_id, status: data.delivered || "failed", error: data.error });
    } catch (e: any) {
      console.error(`[send-daily-report] ${r.guardian_id} 발송 실패:`, e.message);
      results.push({ guardian_id: r.guardian_id, status: "failed", error: e.message });
    }
  }

  const delivered = results.filter(r => r.status !== "failed").length;
  console.log(`[send-daily-report] 완료: ${delivered}/${results.length} 성공`);

  return new Response(JSON.stringify({
    delivered,
    total: results.length,
    results
  }), {
    status: 200,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
  });
});
