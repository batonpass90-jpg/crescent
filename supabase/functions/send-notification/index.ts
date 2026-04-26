// ================================================================
// Supabase Edge Function: send-notification
// 채널 우선순위: 웹푸시 → 알림톡(Solapi) → SMS(Solapi)
//
// 배포:
//   supabase functions deploy send-notification
//
// 시크릿 설정 (Supabase Dashboard → Edge Functions → Secrets):
//   VAPID_PUBLIC_KEY    = (npx web-push generate-vapid-keys 결과)
//   VAPID_PRIVATE_KEY   = (위 명령 결과)
//   VAPID_SUBJECT       = mailto:batonpass90@gmail.com
//   SOLAPI_API_KEY      = (Solapi 콘솔)
//   SOLAPI_API_SECRET   = (Solapi 콘솔)
//   SOLAPI_FROM_NUMBER  = 01090329090
//   SOLAPI_KAKAO_PFID   = (카카오 비즈채널 PFID, 옵션)
//   SOLAPI_KAKAO_TPLID  = (알림톡 템플릿 ID, 옵션)
// ================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as webpush from "https://esm.sh/web-push@3.6.7";

interface Payload {
  recipient_id?: string;
  recipient_phone?: string;
  recipient_name?: string;
  type: string;
  title: string;
  body: string;
  url?: string;
  center_id?: string;
}

// HMAC-SHA256 (Solapi 서명용)
async function hmacSha256(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function solapiAuthHeader(): Promise<string> {
  const apiKey = Deno.env.get("SOLAPI_API_KEY")!;
  const apiSecret = Deno.env.get("SOLAPI_API_SECRET")!;
  const date = new Date().toISOString();
  const salt = crypto.randomUUID().replace(/-/g, "");
  const signature = await hmacSha256(apiSecret, date + salt);
  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

// ── 1. 웹푸시 시도 ──────────────────────────────────────────────
async function tryWebPush(supabase: any, recipientId: string, payload: Payload): Promise<boolean> {
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", recipientId);
  if (!subs || subs.length === 0) return false;

  webpush.setVapidDetails(
    Deno.env.get("VAPID_SUBJECT") || "mailto:batonpass90@gmail.com",
    Deno.env.get("VAPID_PUBLIC_KEY")!,
    Deno.env.get("VAPID_PRIVATE_KEY")!
  );

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || "/care-customer.html",
    tag: payload.type
  });

  let anySuccess = false;
  for (const sub of subs) {
    try {
      await webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      } as any, body);
      anySuccess = true;
    } catch (e: any) {
      // 만료된 구독 제거
      if (e.statusCode === 404 || e.statusCode === 410) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
      }
    }
  }
  return anySuccess;
}

// ── 센터별 발신번호 + 센터명 조회 ────────────────────────────────
async function getCenterInfo(supabase: any, centerId?: string): Promise<{ fromNumber: string; centerName: string }> {
  const fallbackNumber = Deno.env.get("SOLAPI_FROM_NUMBER")!;
  if (!centerId) return { fromNumber: fallbackNumber, centerName: "CareOn" };

  const { data } = await supabase.from("centers")
    .select("name, solapi_from_number")
    .eq("id", centerId).maybeSingle();

  return {
    fromNumber: (data?.solapi_from_number || fallbackNumber).replace(/-/g, ""),
    centerName: data?.name || "CareOn"
  };
}

// ── 2. 알림톡 시도 (Solapi) ─────────────────────────────────────
async function tryKakaoTalk(supabase: any, payload: Payload): Promise<boolean> {
  const pfid = Deno.env.get("SOLAPI_KAKAO_PFID");
  const tplid = Deno.env.get("SOLAPI_KAKAO_TPLID");
  if (!pfid || !tplid || !payload.recipient_phone) return false;

  const { fromNumber, centerName } = await getCenterInfo(supabase, payload.center_id);

  const auth = await solapiAuthHeader();
  const res = await fetch("https://api.solapi.com/messages/v4/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: auth },
    body: JSON.stringify({
      message: {
        to: payload.recipient_phone.replace(/-/g, ""),
        from: fromNumber,
        kakaoOptions: {
          pfId: pfid,
          templateId: tplid,
          variables: {
            "#{이름}": payload.recipient_name || "고객",
            "#{센터}": centerName,
            "#{내용}": payload.body
          }
        }
      }
    })
  });
  if (!res.ok) return false;
  const json = await res.json();
  return json?.statusCode === "2000";
}

// ── 3. SMS 시도 (Solapi) ────────────────────────────────────────
async function trySms(supabase: any, payload: Payload): Promise<boolean> {
  if (!payload.recipient_phone) return false;
  const { fromNumber, centerName } = await getCenterInfo(supabase, payload.center_id);
  const text = `[${centerName}] ${payload.title}\n${payload.body}`;
  const auth = await solapiAuthHeader();
  const res = await fetch("https://api.solapi.com/messages/v4/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: auth },
    body: JSON.stringify({
      message: {
        to: payload.recipient_phone.replace(/-/g, ""),
        from: fromNumber,
        text,
        type: text.length > 90 ? "LMS" : "SMS"
      }
    })
  });
  return res.ok;
}

// ── 메인 핸들러 ─────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
      }
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid json" }), { status: 400 });
  }

  if (!payload.title || !payload.body || !payload.type) {
    return new Response(JSON.stringify({ error: "title/body/type required" }), { status: 400 });
  }

  const attempts: { channel: string; status: string; error?: string }[] = [];

  // 1) 웹푸시
  if (payload.recipient_id) {
    try {
      const ok = await tryWebPush(supabase, payload.recipient_id, payload);
      attempts.push({ channel: "push", status: ok ? "sent" : "skip" });
      if (ok) {
        await supabase.from("notifications").insert({ ...payload, channel: "push", status: "sent", sent_at: new Date().toISOString() });
        return new Response(JSON.stringify({ delivered: "push", attempts }), { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
      }
    } catch (e: any) {
      attempts.push({ channel: "push", status: "failed", error: e.message });
    }
  }

  // 2) 알림톡
  try {
    const ok = await tryKakaoTalk(supabase, payload);
    attempts.push({ channel: "kakao", status: ok ? "sent" : "skip" });
    if (ok) {
      await supabase.from("notifications").insert({ ...payload, channel: "kakao", status: "sent", sent_at: new Date().toISOString() });
      return new Response(JSON.stringify({ delivered: "kakao", attempts }), { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
    }
  } catch (e: any) {
    attempts.push({ channel: "kakao", status: "failed", error: e.message });
  }

  // 3) SMS
  try {
    const ok = await trySms(supabase, payload);
    attempts.push({ channel: "sms", status: ok ? "sent" : "failed" });
    if (ok) {
      await supabase.from("notifications").insert({ ...payload, channel: "sms", status: "sent", sent_at: new Date().toISOString() });
      return new Response(JSON.stringify({ delivered: "sms", attempts }), { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
    }
  } catch (e: any) {
    attempts.push({ channel: "sms", status: "failed", error: e.message });
  }

  // 모두 실패
  await supabase.from("notifications").insert({ ...payload, channel: "sms", status: "failed", error_message: JSON.stringify(attempts) });
  return new Response(JSON.stringify({ delivered: null, attempts }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
});
