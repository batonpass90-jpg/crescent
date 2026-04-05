import { NavLink, Outlet } from 'react-router-dom';
import { Home, Megaphone, GitBranch, Wrench, BarChart2, Zap } from 'lucide-react';
import { isConfigured } from '../lib/supabase';

const NAV = [
  { to: '/', icon: Home, label: '홈' },
  { to: '/sales', icon: Megaphone, label: '영업' },
  { to: '/pipeline', icon: GitBranch, label: '파이프라인' },
  { to: '/work', icon: Wrench, label: '실무' },
  { to: '/analytics', icon: BarChart2, label: '분석' },
];

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 border-r border-white/[0.06] flex flex-col bg-[#0a0c14]">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
              <Zap size={16} className="text-bg" fill="currentColor" />
            </div>
            <div>
              <div className="text-sm font-bold text-textPrimary leading-tight">OnSales</div>
              <div className="text-[10px] text-sub">크레센트 스튜디오</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/[0.06]">
          {!isConfigured && (
            <div className="text-[10px] text-warning bg-warning/10 rounded-lg px-3 py-2 leading-relaxed">
              .env에 Supabase 키를 입력하면 데이터가 연동됩니다
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
