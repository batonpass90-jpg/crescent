// ===========================================
// 스튜디오 코어 필라테스 — 공개 사이트 공통 JS
//
// 구조:
//   - Supabase 클라이언트 초기화
//   - URL ?c=slug 로 센터 식별 (없으면 'demo')
//   - 페이지별로 필요한 데이터를 fetch해서 렌더
//
// 다중 텐트 라우팅:
//   /pilates/                       → demo 센터
//   /pilates/?c=studio-core         → studio-core 센터
//   /pilates/instructor.html?c=...  → 해당 센터의 강사 페이지
// ===========================================

const SUPABASE_URL = 'https://swsemxzgzcwwrhowuaqz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3c2VteHpnemN3d3Job3d1YXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDMyMjAsImV4cCI6MjA5MjcxOTIyMH0.ebLiCDnTfnd-rCcBcMFiN_BYpIcOcTqfi_Mh_xQqD2Q';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// URL ?c= 로 슬러그 얻기 (기본값 demo)
function getCurrentSlug() {
  const params = new URLSearchParams(location.search);
  return params.get('c') || 'demo';
}

// 모든 내부 링크에 ?c=slug 자동 추가
function relinkWithSlug() {
  const slug = getCurrentSlug();
  if (slug === 'demo') return;  // 기본은 표시 안 함
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    // 외부, 앵커, mailto/tel, 절대 URL 제외
    if (/^(https?:|tel:|mailto:|#)/.test(href)) return;
    // .html 또는 디렉토리 링크만
    if (!/\.html$|\/$|^\.\.?\//.test(href)) return;
    const sep = href.includes('?') ? '&' : '?';
    a.setAttribute('href', `${href}${sep}c=${encodeURIComponent(slug)}`);
  });
}

// 한 센터의 모든 정보 조회
async function loadCenter(slug) {
  const { data, error } = await sb
    .from('pilates_centers')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) console.error(error);
  return data;
}

// 안전한 HTML 이스케이프
function esc(s) {
  if (s == null) return '';
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}

// 줄바꿈 보존
function nl2br(s) {
  return esc(s).replaceAll('\n','<br>');
}

// 센터 못 찾을 때 친절한 안내
function renderNotFound(slug) {
  const main = document.querySelector('main') || document.body;
  main.innerHTML = `
    <div class="page-wrap" style="text-align:center; padding-top:120px;">
      <div style="font-size:64px; margin-bottom:24px;">🤔</div>
      <div class="section-title">센터를 찾을 수 없어요</div>
      <p class="section-desc" style="margin-bottom:32px;">
        주소가 정확한지 확인해 주세요. (찾는 슬러그: <code>${esc(slug)}</code>)<br>
        본인의 사이트를 만들고 싶으시다면 아래 버튼을 눌러 회원가입하세요.
      </p>
      <a href="admin/login.html" class="btn-purple btn-lg">사이트 만들기 →</a>
    </div>`;
}

// 공통 헤더/푸터 슬롯 채우기 (페이지에서 호출)
function fillCommonChrome(center) {
  // 상단 띠
  const banner = document.querySelector('.top-banner');
  if (banner && center.tagline) banner.textContent = center.tagline;

  // 로고
  document.querySelectorAll('.logo').forEach(el => {
    el.innerHTML = `${esc(center.name)} <span>${esc(center.brand || '')}</span>`;
  });

  // 전화번호 링크
  document.querySelectorAll('a[data-tel]').forEach(a => {
    if (center.phone) a.setAttribute('href', `tel:${center.phone.replaceAll('-','')}`);
  });

  // 카카오 버튼
  const kk = document.querySelector('.kakao-float');
  if (kk && center.kakao_link) kk.setAttribute('href', center.kakao_link);

  // 푸터 정보
  const footerInfo = document.querySelector('[data-footer-info]');
  if (footerInfo) {
    footerInfo.innerHTML = `
      <div class="footer-logo">${esc(center.name)}</div>
      <div class="footer-info">
        대표: ${esc(center.ceo_name || '-')}
        ${center.business_number ? ` | 사업자번호: ${esc(center.business_number)}` : ''}<br>
        ${esc(center.address || '')}
        ${center.address_detail ? ` ${esc(center.address_detail)}` : ''}<br>
        Tel: ${esc(center.phone || '-')}<br>
        <span style="opacity:0.5">© ${new Date().getFullYear()} ${esc(center.name)}</span>
      </div>`;
  }

  // 페이지 타이틀
  if (document.title.includes('|')) {
    const before = document.title.split('|')[0].trim();
    document.title = `${before} | ${center.name}`;
  }
}

// 페이지 부트스트랩
async function bootPage(renderer) {
  const slug = getCurrentSlug();
  const center = await loadCenter(slug);
  if (!center) {
    renderNotFound(slug);
    return;
  }
  fillCommonChrome(center);
  // 페이지별 추가 렌더링
  try {
    await renderer(center);
  } catch (e) {
    console.error('Render error:', e);
  }
  relinkWithSlug();
}

window.PILATES = { sb, getCurrentSlug, loadCenter, esc, nl2br, fillCommonChrome, bootPage, relinkWithSlug };
