// CareOn Service Worker — 오프라인 지원 + 캐시 전략
const CACHE_NAME = 'careon-v1';
const STATIC_ASSETS = [
  '/care-login.html',
  '/care-admin.html',
  '/care-worker.html',
  '/care-customer.html',
  '/careon-icon.svg',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700;800&display=swap'
];

// ── 설치: 핵심 파일 사전 캐시 ──────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── 활성화: 이전 버전 캐시 삭제 ───────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── 요청 처리: 전략별 분기 ────────────────────────────────────────
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Supabase API 요청: 캐시 안 함 (항상 네트워크)
  if (url.hostname.includes('supabase.co')) {
    return; // 기본 fetch 동작 유지
  }

  // 폰트/CDN: 캐시 우선, 없으면 네트워크
  if (url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com') ||
      url.hostname.includes('cdn.jsdelivr.net')) {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      }))
    );
    return;
  }

  // HTML 파일: 네트워크 우선, 실패 시 캐시 (오프라인 지원)
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request).then(r => r || caches.match('/care-login.html')))
    );
    return;
  }

  // 기타: 캐시 우선
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

// ── 푸시 알림 수신 ───────────────────────────────────────────────
self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'CareOn 알림', {
      body: data.body || '',
      icon: '/careon-icon.svg',
      badge: '/careon-icon.svg',
      tag: data.tag || 'careon',
      data: { url: data.url || '/care-admin.html' }
    })
  );
});

// ── 알림 클릭 → 해당 화면으로 이동 ───────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = e.notification.data?.url || '/care-admin.html';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const match = list.find(c => c.url.includes(target));
      if (match) return match.focus();
      return clients.openWindow(target);
    })
  );
});
