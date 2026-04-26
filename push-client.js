/* ================================================================
 * CareOn Push Client
 * - 사용자에게 알림 권한 요청
 * - PushManager 구독 → push_subscriptions 테이블에 저장
 * - 채널 우선순위: 웹푸시 → 알림톡 → SMS (서버에서 폴백)
 * ============================================================== */

(function (global) {
  'use strict';

  // ⚠️ Supabase Functions Secrets에 설정한 VAPID 공개키와 동일해야 함
  // 발급: npx web-push generate-vapid-keys
  const VAPID_PUBLIC_KEY = 'BFNc5bFrOGwxPN-ZQw6hw1O0n_VupW9_TD_NRXzhO0j5syR0SQjCm4HJr020-xSCqvAaGmBfVeKkyUy8_BPNSQ0';

  function urlBase64ToUint8Array(base64) {
    const padding = '='.repeat((4 - base64.length % 4) % 4);
    const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(b64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    return arr;
  }

  /**
   * 알림 권한 요청 + Push 구독
   * @returns {Promise<{success:boolean, error?:string}>}
   */
  async function requestAndSubscribe(sb, centerId) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return { success: false, error: '이 브라우저는 푸시 알림을 지원하지 않습니다.' };
    }
    if (VAPID_PUBLIC_KEY.startsWith('REPLACE')) {
      console.warn('[PushClient] VAPID 공개키 미설정 — push 비활성');
      return { success: false, error: 'VAPID 공개키 미설정' };
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return { success: false, error: '알림 권한이 거부되었습니다.' };

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
      }

      const json = sub.toJSON();
      const { data: { session } } = await sb.auth.getSession();
      if (!session) return { success: false, error: '로그인이 필요합니다.' };

      const { error } = await sb.from('push_subscriptions').upsert({
        user_id: session.user.id,
        center_id: centerId || null,
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
        user_agent: navigator.userAgent,
        last_used: new Date().toISOString()
      }, { onConflict: 'endpoint' });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  /**
   * 구독 해제
   */
  async function unsubscribe(sb) {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await sb.from('push_subscriptions').delete().eq('endpoint', endpoint);
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  /**
   * 알림 발송 (Edge Function 호출)
   * 서버에서 push → kakao → sms 순으로 자동 폴백
   *
   * @param {SupabaseClient} sb
   * @param {object} payload {
   *   recipient_id?: uuid       // user_id (있으면 push 시도)
   *   recipient_phone?: string  // 010xxxx (push 실패 시 fallback)
   *   recipient_name?: string
   *   type: string              // visit_start | care_complete | unpaid | custom
   *   title: string
   *   body: string
   *   url?: string              // 클릭 시 이동
   *   center_id?: uuid
   * }
   */
  async function sendNotification(sb, payload) {
    const { data, error } = await sb.functions.invoke('send-notification', { body: payload });
    if (error) {
      console.error('[PushClient] sendNotification error:', error);
      return { success: false, error: error.message };
    }
    return { success: true, ...data };
  }

  global.PushClient = { requestAndSubscribe, unsubscribe, sendNotification };
})(window);
