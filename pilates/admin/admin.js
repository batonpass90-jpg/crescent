// ===========================================
// Admin 공통 JS
//   - Supabase Auth
//   - 사이드바 렌더링
//   - 현재 센터 조회/생성
//   - 토스트, 모달 등 UI 유틸
// ===========================================

const SUPABASE_URL = 'https://swsemxzgzcwwrhowuaqz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3c2VteHpnemN3d3Job3d1YXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDMyMjAsImV4cCI6MjA5MjcxOTIyMH0.ebLiCDnTfnd-rCcBcMFiN_BYpIcOcTqfi_Mh_xQqD2Q';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
});

// ── 안전 헬퍼 ──
function esc(s) {
  if (s == null) return '';
  return String(s)
    .replaceAll('&','&amp;').replaceAll('<','&lt;')
    .replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
}

// ── 토스트 ──
let _toastEl = null;
function toast(message, type = 'success') {
  if (!_toastEl) {
    _toastEl = document.createElement('div');
    _toastEl.className = 'toast';
    document.body.appendChild(_toastEl);
  }
  _toastEl.textContent = message;
  _toastEl.className = `toast ${type}`;
  requestAnimationFrame(() => _toastEl.classList.add('show'));
  clearTimeout(_toastEl._t);
  _toastEl._t = setTimeout(() => _toastEl.classList.remove('show'), 2400);
}

// ── 인증 가드 ──
async function requireAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    location.replace('login.html');
    throw new Error('not authenticated');
  }
  return session.user;
}

async function getCurrentUser() {
  const { data: { session } } = await sb.auth.getSession();
  return session ? session.user : null;
}

// ── 현재 센터 (사용자 소유) 조회 또는 생성 ──
async function ensureCenter(user) {
  // 이미 본인 명의 센터가 있는지 확인
  const { data: existing } = await sb
    .from('pilates_centers')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1);

  if (existing && existing.length) return existing[0];

  // 없으면 자동 생성 (slug = 이메일 앞부분-랜덤4자리)
  const base = (user.email || 'studio').split('@')[0].replace(/[^a-z0-9]/gi,'').toLowerCase().slice(0,20) || 'studio';
  const rnd = Math.random().toString(36).slice(2,6);
  const slug = `${base}-${rnd}`;
  const { data: created, error } = await sb
    .from('pilates_centers')
    .insert({
      slug,
      owner_id: user.id,
      name: '내 필라테스 스튜디오',
      brand: '필라테스',
      tagline: '지금 등록하면, 첫 수업 1회 무료 체험!',
      hero_title: '내 몸에 딱 맞는',
      hero_highlight: '1:1 맞춤 필라테스',
      hero_subtitle: '지금 시작하세요',
      hero_description: '체형 교정부터 코어 강화까지, 전문 강사와 함께하는 맞춤형 프로그램을 경험해 보세요.',
      phone: '010-0000-0000',
      address: '주소를 입력하세요',
      business_hours: '평일 07:00~22:00 | 주말 09:00~18:00',
      ceo_name: '대표자명',
      intro_paragraph: '검증된 자격증과 다년간의 현장 경험을 갖춘 강사진이 함께합니다',
      stats: [
        { num: '500+', label: '누적 회원' },
        { num: '5년', label: '운영 경력' },
        { num: '4.9★', label: '회원 만족도' }
      ]
    })
    .select()
    .single();
  if (error) {
    console.error(error);
    toast('센터 생성 실패: ' + error.message, 'error');
    throw error;
  }
  return created;
}

// ── 사이드바 ──
const SIDEBAR_LINKS = [
  { group: '내 사이트', items: [
    { href: 'index.html',       icon: '📊', label: '대시보드' },
    { href: 'info.html',        icon: '🏢', label: '기본 정보' },
  ]},
  { group: '콘텐츠', items: [
    { href: 'instructors.html', icon: '👩', label: '강사' },
    { href: 'classes.html',     icon: '🧘', label: '수업 종류' },
    { href: 'schedule.html',    icon: '🗓️', label: '시간표' },
    { href: 'pricing.html',     icon: '💳', label: '가격' },
    { href: 'youtube.html',     icon: '▶️', label: '유튜브' },
  ]},
];

function renderSidebar(user, center, activeHref) {
  const sections = SIDEBAR_LINKS.map(g => `
    <div class="sidebar-section">
      <h4>${esc(g.group)}</h4>
      ${g.items.map(it => `
        <a href="${esc(it.href)}" class="sidebar-link ${activeHref === it.href ? 'active' : ''}">
          <span class="icon">${it.icon}</span>${esc(it.label)}
        </a>`).join('')}
    </div>`).join('');

  const previewUrl = `../index.html?c=${encodeURIComponent(center.slug)}`;

  const html = `
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="logo">${esc(center.name)} <span>관리자</span></div>
        <div class="role-tag">slug: ${esc(center.slug)}</div>
      </div>
      ${sections}
      <div class="sidebar-section">
        <h4>외부</h4>
        <a href="${esc(previewUrl)}" target="_blank" class="sidebar-link">
          <span class="icon">🔗</span>내 사이트 보기
        </a>
      </div>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <b>${esc(user.email)}</b>
          원장님
        </div>
        <button class="btn-logout" id="btn-logout">로그아웃</button>
      </div>
    </aside>`;
  document.getElementById('sidebar-mount').outerHTML = html;
  document.getElementById('btn-logout').addEventListener('click', async () => {
    await sb.auth.signOut();
    location.href = 'login.html';
  });
}

// ── 페이지 부트스트랩 (admin 페이지에서 호출) ──
async function bootAdmin(activeHref, renderer) {
  const user = await requireAuth();
  const center = await ensureCenter(user);
  renderSidebar(user, center, activeHref);
  try {
    await renderer({ user, center });
  } catch (e) {
    console.error(e);
    toast('오류: ' + (e.message || e), 'error');
  }
}

// ── 확인 다이얼로그 ──
function confirmAction(message) {
  return window.confirm(message);
}

window.ADMIN = {
  sb, esc, toast,
  requireAuth, getCurrentUser, ensureCenter,
  renderSidebar, bootAdmin, confirmAction,
};
