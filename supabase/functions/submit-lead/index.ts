// ================================================================
// Supabase Edge Function: submit-lead
//
// 보호자가 진단 페이지에서 [상담 신청] 누르면 호출됨.
//   1. submit_lead RPC 호출 (잔액 검증 → 차감 → leads insert)
//   2. 성공 시 센터장에게 SMS 발송 (Solapi)
//
// 배포:
//   supabase functions deploy submit-lead --no-verify-jwt
//
// 시크릿 (Supabase Dashboard → Edge Functions → Secrets):
//   SOLAPI_API_KEY      = (Solapi 콘솔)
//   SOLAPI_API_SECRET   = (Solapi 콘솔)
//   SOLAPI_FROM_NUMBER  = 01090329090
// ================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface LeadPayload {
  center_slug: string;
  method: 'form' | 'call';
  parent_name: string | null;
  parent_phone: string | null;
  preferred_time: string | null;
  answers: Record<string, any>;
  result: {
    grade: string;
    gradeLabel: string;
    totalScore: number;
    confidence: number;
    minCost: number;
    maxCost: number;
    rate: number;
    hasDementia: boolean;
    hasStroke: boolean;
    hasParkinson: boolean;
    hasArthritis: boolean;
    medicalNeed: boolean;
    [k: string]: any;
  };
}

// CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// HMAC-SHA256 for Solapi
async function hmacSha256(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2,"0")).join("");
}

async function solapiAuthHeader(): Promise<string> {
  const apiKey = Deno.env.get("SOLAPI_API_KEY")!;
  const apiSecret = Deno.env.get("SOLAPI_API_SECRET")!;
  const date = new Date().toISOString();
  const salt = crypto.randomUUID().replace(/-/g, "");
  const signature = await hmacSha256(apiSecret, date + salt);
  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

async function sendSms(to: string, text: string): Promise<boolean> {
  try {
    const from = Deno.env.get("SOLAPI_FROM_NUMBER")!;
    const auth = await solapiAuthHeader();
    const res = await fetch("https://api.solapi.com/messages/v4/send", {
      method: "POST",
      headers: { "Authorization": auth, "Content-Type": "application/json" },
      body: JSON.stringify({ message: { to: to.replace(/-/g,""), from, text } })
    });
    if (!res.ok) {
      console.error("[solapi] send failed:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("[solapi] error:", e);
    return false;
  }
}

function buildAlertMessage(centerName: string, lead: any, balanceAfter: number): string {
  const r = lead.raw_result || {};
  const parts = [
    `[CareOn 무료진단 신규 DB]`,
    `센터: ${centerName}`,
    `보호자: ${lead.parent_name || '(미입력)'} / ${lead.parent_phone || '(통화전용)'}`,
    `예상 등급: ${r.gradeLabel || '—'} (점수 ${r.totalScore || '—'})`,
    `예상 비용: 월 ${r.minCost || 0}만~${r.maxCost || 0}만원`,
  ];
  if (lead.preferred_time) parts.push(`통화 가능: ${lead.preferred_time}`);
  if (r.hasDementia) parts.push(`⚠️ 치매 진단`);
  if (r.medicalNeed) parts.push(`⚠️ 의료처치 필요`);
  parts.push(`충전 잔액: ${balanceAfter.toLocaleString()}원`);
  parts.push(`상세: ${Deno.env.get("CAREON_ADMIN_URL") || "https://crescentstudio.co.kr/careon-lead-admin.html"}`);
  return parts.join('\n');
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    const payload: LeadPayload = await req.json();

    // 기본 검증
    if (!payload.center_slug) {
      return new Response(JSON.stringify({ ok: false, error: "missing_center_slug" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (payload.method === 'form') {
      if (!payload.parent_name || !payload.parent_phone) {
        return new Response(JSON.stringify({ ok: false, error: "missing_contact_info" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 환자 상태 요약
    const summary: string[] = [];
    const r = payload.result;
    if (r.hasDementia) summary.push("치매");
    if (r.hasStroke) summary.push("뇌졸중");
    if (r.hasParkinson) summary.push("파킨슨");
    if (r.hasArthritis) summary.push("관절염");
    if (r.medicalNeed) summary.push("의료처치 필요");
    const summaryText = summary.length > 0 ? summary.join(", ") : "특이질환 없음";

    // RPC 호출 (트랜잭션: 잔액 검증 → 차감 → leads insert)
    const { data, error } = await supabase.rpc("submit_lead", {
      p_center_slug: payload.center_slug,
      p_parent_name: payload.parent_name,
      p_parent_phone: payload.parent_phone,
      p_preferred_time: payload.preferred_time,
      p_predicted_grade: r.gradeLabel,
      p_predicted_score: r.totalScore,
      p_cost_min: r.minCost,
      p_cost_max: r.maxCost,
      p_patient_summary: summaryText,
      p_has_dementia: r.hasDementia,
      p_has_stroke: r.hasStroke,
      p_has_parkinson: r.hasParkinson,
      p_has_arthritis: r.hasArthritis,
      p_medical_need: r.medicalNeed,
      p_insurance_rate: r.rate,
      p_method: payload.method,
      p_raw_answers: payload.answers,
      p_raw_result: payload.result
    });

    if (error) {
      console.error("[submit_lead rpc]", error);
      return new Response(JSON.stringify({ ok: false, error: "rpc_failed", detail: error.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!data?.ok) {
      // 잔액 부족 등
      return new Response(JSON.stringify(data), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 센터장에게 SMS (call 방식이라도 통화 시도 알림 보냄)
    const alertPhone = data.center_alert_phone;
    if (alertPhone) {
      const lead = {
        parent_name: payload.parent_name,
        parent_phone: payload.parent_phone,
        preferred_time: payload.preferred_time,
        raw_result: r
      };
      const text = buildAlertMessage(data.center_name, lead, data.balance_after);
      // 비동기 (실패해도 lead는 이미 저장됨)
      sendSms(alertPhone, text).catch(e => console.error("[sms failed]", e));
    }

    return new Response(JSON.stringify({
      ok: true,
      lead_id: data.lead_id,
      balance_after: data.balance_after
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (e: any) {
    console.error("[submit-lead]", e);
    return new Response(JSON.stringify({ ok: false, error: "internal_error", detail: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
