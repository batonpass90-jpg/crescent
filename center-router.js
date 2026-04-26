/* ================================================================
 * CareOn Center Router
 * 센터 슬러그를 다음 우선순위로 감지:
 *   1) 서브도메인 (seoulcare.careon.co.kr)
 *   2) URL 쿼리 파라미터 (?c=seoulcare)
 *   3) 경로 세그먼트 (/c/seoulcare/...)
 *   4) localStorage 캐시 (이전 방문 기억)
 * ============================================================== */

(function (global) {
  'use strict';

  const ROOT_HOSTS = ['careon.co.kr', 'www.careon.co.kr', 'crescentstudio.co.kr',
                      'localhost', '127.0.0.1', 'github.io', 'pages.dev'];
  const RESERVED_SUBS = ['www', 'admin', 'super', 'api', 'app'];
  const STORAGE_KEY = 'careon_center_slug';

  function detectSlug() {
    // 1) 서브도메인
    const host = location.hostname;
    const parts = host.split('.');
    if (parts.length >= 3 && !ROOT_HOSTS.includes(host)) {
      const sub = parts[0];
      if (sub && !RESERVED_SUBS.includes(sub) && /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/.test(sub)) {
        cacheSlug(sub);
        return sub;
      }
    }

    // 2) 쿼리 파라미터 ?c=...
    const qs = new URLSearchParams(location.search);
    const qSlug = qs.get('c') || qs.get('center');
    if (qSlug && /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/.test(qSlug)) {
      cacheSlug(qSlug);
      return qSlug;
    }

    // 3) 경로 /c/<slug>/...
    const pm = location.pathname.match(/^\/c\/([a-z0-9][a-z0-9-]{1,30}[a-z0-9])(?:\/|$)/);
    if (pm) {
      cacheSlug(pm[1]);
      return pm[1];
    }

    // 4) localStorage 캐시
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached && /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/.test(cached)) return cached;
    } catch (e) {}

    return null;
  }

  function cacheSlug(slug) {
    try { localStorage.setItem(STORAGE_KEY, slug); } catch (e) {}
  }

  function clearSlug() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  /**
   * Supabase에서 센터 정보 로드
   * @param {SupabaseClient} sb
   * @param {string} slug
   * @returns {Promise<object|null>}
   */
  async function loadCenterBySlug(sb, slug) {
    if (!sb || !slug) return null;
    const { data, error } = await sb
      .from('centers')
      .select('id, name, slug, phone, address, primary_color, description, hero_image_url, business_hours, service_area')
      .eq('slug', slug)
      .single();
    if (error) {
      console.warn('[CenterRouter] center not found for slug:', slug, error);
      return null;
    }
    return data;
  }

  /**
   * 마케팅 사이트에서 센터 정보를 DOM에 주입
   * data-bind="name|phone|address|description|hours|area" 속성 사용
   */
  function applyCenterToDOM(center) {
    if (!center) return;
    document.querySelectorAll('[data-bind]').forEach(el => {
      const key = el.getAttribute('data-bind');
      const map = {
        name: center.name,
        phone: center.phone,
        address: center.address,
        description: center.description,
        hours: center.business_hours,
        area: center.service_area
      };
      if (map[key] !== undefined && map[key] !== null) {
        el.textContent = map[key];
      }
    });
    // 테마 컬러 적용
    if (center.primary_color) {
      document.documentElement.style.setProperty('--teal', center.primary_color);
    }
    // 페이지 타이틀 자동 업데이트
    if (center.name && document.title) {
      document.title = document.title.replace(/^[^—·|]+/, center.name + ' ');
    }
  }

  /**
   * 로그인/앱 페이지로 이동 시 슬러그 유지
   */
  function buildUrl(path, slug) {
    slug = slug || detectSlug();
    if (!slug) return path;
    const sep = path.includes('?') ? '&' : '?';
    return path + sep + 'c=' + encodeURIComponent(slug);
  }

  global.CenterRouter = { detectSlug, loadCenterBySlug, applyCenterToDOM, buildUrl, cacheSlug, clearSlug };
})(window);
