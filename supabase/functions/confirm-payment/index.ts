// ================================================================
// Supabase Edge Function: confirm-payment
// 토스페이먼츠 결제 승인 + sms_extra_quota 증가
//
// 호출 흐름:
//   payment-success.html → 이 함수 → 토스 confirm API → add_sms_quota RPC
//
// 배포:
//   supabase functions deploy confirm-payment
//
// 시크릿 (Supabase Dashboard → Edge Functions → Secrets):
//   TOSS_SECRET_KEY = test_sk_... (또는 라이브 키 live_sk_...)
//
// 토스 API 문서: https://docs.tosspayments.com/reference#payment
// ================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

interface RequestBody {
  paymentKey: string;
  orderId: string;
  amount: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResp({ success: false, error: "잘못된 요청 형식" }, 400);
  }

  const { paymentKey, orderId, amount } = body;
  if (!paymentKey || !orderId || !amount) {
    return jsonResp({ success: false, error: "paymentKey/orderId/amount 필수" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // ── 1) 주문 검증 (DB 금액과 클라이언트 금액 일치 확인) ─────────
  const { data: purchase, error: purchaseErr } = await supabase
    .from("sms_purchases")
    .select("*")
    .eq("order_id", orderId)
    .single();

  if (purchaseErr || !purchase) {
    return jsonResp({ success: false, error: "주문을 찾을 수 없습니다" }, 404);
  }

  if (purchase.amount !== amount) {
    // 위변조 의심
    return jsonResp({ success: false, error: "결제 금액 불일치" }, 400);
  }

  // 이미 처리된 결제 (멱등성)
  if (purchase.status === "paid") {
    return jsonResp({ success: true, alreadyProcessed: true, count: purchase.count });
  }

  // ── 2) 토스 결제 승인 API 호출 ──────────────────────────────────
  const tossSecret = Deno.env.get("TOSS_SECRET_KEY");
  if (!tossSecret) {
    return jsonResp({ success: false, error: "TOSS_SECRET_KEY 미설정" }, 500);
  }

  // 토스는 Basic 인증 (시크릿 키 + ":" 을 base64)
  const authHeader = "Basic " + btoa(tossSecret + ":");

  const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      "Authorization": authHeader,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ paymentKey, orderId, amount })
  });

  const tossData = await tossRes.json();

  if (!tossRes.ok) {
    // 결제 승인 실패 (토스 에러)
    await supabase.rpc("fail_sms_purchase", {
      p_order_id: orderId,
      p_reason: `토스 승인 실패: ${tossData.code}: ${tossData.message}`
    });
    return jsonResp({
      success: false,
      error: tossData.message || "토스 결제 승인 실패",
      code: tossData.code
    }, 400);
  }

  // ── 3) DB에 결제 완료 기록 + sms_extra_quota 증가 ──────────────
  const { data: addResult, error: addErr } = await supabase.rpc("add_sms_quota", {
    p_order_id: orderId,
    p_payment_key: paymentKey,
    p_toss_data: tossData
  });

  if (addErr || !addResult?.success) {
    // 결제는 됐지만 quota 적용 실패 - 수동 처리 필요
    return jsonResp({
      success: false,
      error: "결제는 완료됐으나 충전 처리 실패. 운영자에게 문의해주세요.",
      orderId,
      detail: addErr?.message || addResult?.error
    }, 500);
  }

  return jsonResp({
    success: true,
    count: addResult.count,
    amount: addResult.amount,
    paymentKey
  });
});

function jsonResp(obj: any, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
  });
}
