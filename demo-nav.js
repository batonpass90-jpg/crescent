/* ================================================================
 * CareOn Demo Navigator
 * 4개 데모 페이지 간 자유 이동 + 영업 시연 보조 도구
 *
 * 사용법: <script src="/demo-nav.js"></script> 만 추가하면 자동 동작
 * ============================================================== */

(function () {
  'use strict';

  const DEMOS = [
    { id: 'site',     icon: '🌐', label: '마케팅 사이트', sub: '신규 가족 진입',     url: '/care-site-demo.html' },
    { id: 'customer', icon: '👨‍👩‍👧', label: '보호자 앱',    sub: '박지영(자녀) 시점',    url: '/care-customer-demo.html' },
    { id: 'worker',   icon: '👩‍⚕️', label: '보호사 앱',    sub: '김미영 보호사 시점',   url: '/care-worker-demo.html' },
    { id: 'admin',    icon: '📊', label: '센터장 대시보드', sub: '홍길동 센터장 시점',  url: '/care-admin-demo.html' }
  ];

  // 현재 페이지 식별
  function detectCurrent() {
    const p = location.pathname;
    if (p.includes('site-demo')) return 'site';
    if (p.includes('customer-demo')) return 'customer';
    if (p.includes('worker-demo')) return 'worker';
    if (p.includes('admin-demo')) return 'admin';
    return null;
  }

  function inject() {
    if (document.getElementById('demoNavBtn')) return; // 중복 방지

    // 스타일
    const style = document.createElement('style');
    style.textContent = `
      #demoNavBtn{position:fixed;right:14px;bottom:14px;z-index:9998;background:#0F1B2D;color:#fff;border:none;border-radius:50px;padding:10px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 8px 24px rgba(0,0,0,.35);display:flex;align-items:center;gap:6px;transition:transform .15s}
      #demoNavBtn:hover{transform:translateY(-2px)}
      #demoNavBtn .pulse{width:7px;height:7px;border-radius:50%;background:#5eead4;animation:demoNavBlink 1.4s infinite}
      @keyframes demoNavBlink{0%,100%{opacity:1}50%{opacity:.3}}
      #demoNavPanel{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:none;align-items:flex-end;justify-content:center;padding:0;font-family:inherit}
      #demoNavPanel.show{display:flex}
      #demoNavCard{background:#fff;border-radius:24px 24px 0 0;width:100%;max-width:430px;padding:24px 18px 28px;color:#0F1B2D;animation:demoNavSlide .25s ease-out}
      @keyframes demoNavSlide{from{transform:translateY(100%)}to{transform:translateY(0)}}
      .demo-nav-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
      .demo-nav-ttl{font-size:16px;font-weight:800}
      .demo-nav-x{background:#f1f5f9;border:none;width:32px;height:32px;border-radius:50%;font-size:14px;cursor:pointer;color:#6b7280;font-family:inherit}
      .demo-nav-sub{font-size:12px;color:#6b7280;margin-bottom:14px;line-height:1.5}
      .demo-nav-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .demo-nav-item{background:#f8fafc;border:2px solid #e2e8f0;border-radius:14px;padding:14px 12px;cursor:pointer;text-align:left;transition:all .15s;text-decoration:none;color:inherit;display:block}
      .demo-nav-item:hover{border-color:#0D9488;background:#F0FDFA}
      .demo-nav-item.current{border-color:#0D9488;background:#F0FDFA;cursor:default}
      .demo-nav-item.current::after{content:' • 현재';color:#0D9488;font-size:10px;font-weight:700}
      .demo-nav-icon{font-size:24px;margin-bottom:6px}
      .demo-nav-name{font-size:13px;font-weight:800;color:#0F1B2D;line-height:1.2}
      .demo-nav-vp{font-size:11px;color:#6b7280;margin-top:3px;line-height:1.3}
      .demo-nav-foot{margin-top:14px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:11px;color:#6b7280;line-height:1.6;text-align:center}
      .demo-nav-foot b{color:#0D9488}
      @media(min-width:768px){
        #demoNavBtn{right:24px;bottom:24px}
        #demoNavPanel{align-items:center}
        #demoNavCard{border-radius:24px;max-height:90vh;overflow-y:auto}
      }
    `;
    document.head.appendChild(style);

    // 플로팅 버튼
    const btn = document.createElement('button');
    btn.id = 'demoNavBtn';
    btn.innerHTML = '<span class="pulse"></span> 다른 화면 둘러보기';
    btn.setAttribute('aria-label', '데모 화면 전환');
    document.body.appendChild(btn);

    // 패널
    const panel = document.createElement('div');
    panel.id = 'demoNavPanel';
    const current = detectCurrent();
    panel.innerHTML = `
      <div id="demoNavCard">
        <div class="demo-nav-hd">
          <div class="demo-nav-ttl">🎬 CareOn 데모 둘러보기</div>
          <button class="demo-nav-x" aria-label="닫기">✕</button>
        </div>
        <div class="demo-nav-sub">동일한 시점(2026-04-26 12:13)을 4가지 시점에서 확인하세요</div>
        <div class="demo-nav-grid">
          ${DEMOS.map(d => `
            <a href="${current === d.id ? '#' : d.url}" class="demo-nav-item ${current === d.id ? 'current' : ''}" ${current === d.id ? 'onclick="event.preventDefault()"' : ''}>
              <div class="demo-nav-icon">${d.icon}</div>
              <div class="demo-nav-name">${d.label}</div>
              <div class="demo-nav-vp">${d.sub}</div>
            </a>
          `).join('')}
        </div>
        <div class="demo-nav-foot">
          이 데모는 <b>가상 데이터</b>입니다. 실제 운영 시엔 센터별 다른 데이터가 표시됩니다.<br>
          <span style="display:inline-block;margin-top:4px">문의: <b>batonpass90@gmail.com</b></span>
        </div>
      </div>
    `;
    document.body.appendChild(panel);

    btn.onclick = () => panel.classList.add('show');
    panel.querySelector('.demo-nav-x').onclick = () => panel.classList.remove('show');
    panel.onclick = (e) => { if (e.target === panel) panel.classList.remove('show'); };

    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') panel.classList.remove('show');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
