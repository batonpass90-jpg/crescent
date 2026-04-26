/* ================================================================
 * Cloudflare Worker — CareOn 서브도메인 라우팅
 *
 * 목적: *.careon.co.kr 와일드카드 서브도메인을 GitHub Pages로 프록시
 *       서브도메인을 ?c=<slug> 파라미터로 변환
 *
 * 배포:
 *   1) Cloudflare 계정 → Workers & Pages → Create Worker
 *   2) 이 파일 내용 붙여넣기 → Save and Deploy
 *   3) Workers Routes에서 *.careon.co.kr/* 패턴 등록
 *   4) DNS: *.careon.co.kr → A record (CF 프록시 ON)
 *
 * 동작 예시:
 *   sunshine.careon.co.kr             → crescentstudio.co.kr/care-site.html?c=sunshine
 *   sunshine.careon.co.kr/login       → crescentstudio.co.kr/care-login.html?c=sunshine
 *   sunshine.careon.co.kr/admin       → crescentstudio.co.kr/care-admin.html?c=sunshine
 *   www.careon.co.kr or careon.co.kr  → crescentstudio.co.kr (메인)
 * ============================================================== */

const ORIGIN = 'https://batonpass90-jpg.github.io/crescent';
// 또는 사용자 도메인: 'https://crescentstudio.co.kr'

const RESERVED = new Set(['www', 'admin', 'super', 'api', 'app']);

const PATH_MAP = {
  '/':         '/care-site.html',
  '/login':    '/care-login.html',
  '/admin':    '/care-admin.html',
  '/worker':   '/care-worker.html',
  '/customer': '/care-customer.html',
  '/family':   '/care-customer.html'
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname;
    const parts = host.split('.');

    // 메인 도메인 (careon.co.kr / www.careon.co.kr) → 그대로 메인 사이트
    if (parts.length < 3 || RESERVED.has(parts[0])) {
      return fetch(ORIGIN + (url.pathname === '/' ? '/index.html' : url.pathname) + url.search);
    }

    const slug = parts[0];
    if (!/^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/.test(slug)) {
      return new Response('Invalid subdomain', { status: 400 });
    }

    // 경로 매핑
    const mappedPath = PATH_MAP[url.pathname] || url.pathname;

    // ?c=<slug> 파라미터 주입
    const targetUrl = new URL(ORIGIN + mappedPath);
    for (const [k, v] of url.searchParams) targetUrl.searchParams.set(k, v);
    targetUrl.searchParams.set('c', slug);

    // 원본 GitHub Pages로 프록시 + 응답 그대로 전달
    const upstream = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body
    });

    // HTML이면 base href 주입 (이미지/스크립트 절대경로 보정)
    const ct = upstream.headers.get('content-type') || '';
    if (ct.includes('text/html')) {
      const html = await upstream.text();
      const injected = html.replace(/<head>/i,
        `<head>\n<base href="${ORIGIN}/">`);
      return new Response(injected, {
        status: upstream.status,
        headers: upstream.headers
      });
    }

    return upstream;
  }
};
