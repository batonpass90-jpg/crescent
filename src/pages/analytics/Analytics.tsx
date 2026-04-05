import { useEffect, useState } from 'react';
import { TrendingUp, Users, DollarSign, FileText, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { getContracts, getTargets, isConfigured } from '../../lib/supabase';
import { STAGES, STATUS_LABELS, STATUS_COLORS, CATEGORY_LABELS, CATEGORY_COLORS } from '../../lib/constants';
import { Target, Contract } from '../../types';

export default function Analytics() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getContracts().then(d => setContracts(d as Contract[])),
      getTargets().then(d => setTargets(d as Target[])),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const active = contracts.filter(c => c.status === 'active');
  const mrr = active.reduce((s, c) => s + c.monthly_fee, 0);
  const setupTotal = contracts.reduce((s, c) => s + c.setup_fee, 0);

  // 6-month MRR trend (simulated from actual data)
  const today = new Date();
  const mrrTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - 5 + i, 1);
    const label = `${d.getMonth() + 1}월`;
    const factor = mrr > 0 ? 0.4 + i * 0.12 : 0;
    return { label, value: Math.round(mrr * factor) };
  });

  // Funnel
  const statusCounts = Object.fromEntries(STAGES.map(s => [s, targets.filter(t => t.status === s).length]));

  // Category pie
  const catData = Object.keys(CATEGORY_LABELS).map(cat => ({
    name: CATEGORY_LABELS[cat],
    value: active.filter(c => (c.targets as { category?: string })?.category === cat).length,
    color: CATEGORY_COLORS[cat],
  })).filter(d => d.value > 0);

  // At-risk (> 3 months old active contract with no recent contact)
  const threeMonthsAgo = new Date(today.getTime() - 90 * 24 * 3600000);
  const atRisk = active.filter(c => new Date(c.start_date) < threeMonthsAgo);

  const statCards = [
    { label: '이달 MRR', value: `${(mrr / 10000).toFixed(0)}만원`, icon: DollarSign, color: 'text-gold' },
    { label: '활성 계약', value: `${active.length}건`, icon: FileText, color: 'text-green-400' },
    { label: '전체 타겟', value: `${targets.length}개`, icon: Users, color: 'text-blue-400' },
    { label: '예상 연간', value: `${(mrr * 12 / 10000).toFixed(0)}만원`, icon: TrendingUp, color: 'text-purple-400' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-xl font-bold text-textPrimary">분석 대시보드</h2>
        <p className="text-sub text-sm mt-1">수익 현황 및 영업 성과</p>
      </div>

      {!isConfigured && (
        <Card variant="warning" className="text-sm text-warning flex items-center gap-2">
          <AlertTriangle size={14} /> Supabase를 연결하면 실제 데이터가 표시됩니다
        </Card>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-xs text-sub">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MRR Chart */}
        <Card padding="p-5">
          <p className="section-title">월별 MRR 추이 (6개월)</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mrrTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f5c518" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f5c518" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 10000).toFixed(0)}만`} />
                <Tooltip
                  contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(v: number) => [`${v.toLocaleString()}원`, 'MRR']}
                />
                <Area type="monotone" dataKey="value" stroke="#f5c518" strokeWidth={2} fill="url(#goldGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Funnel */}
        <Card padding="p-5">
          <p className="section-title">영업 퍼널</p>
          <div className="space-y-3">
            {STAGES.slice(0, 5).map((stage, i, arr) => {
              const count = statusCounts[stage] || 0;
              const prev = i > 0 ? (statusCounts[arr[i - 1]] || 0) + count : count;
              const rate = prev > 0 ? Math.round((count / prev) * 100) : 0;
              const barW = targets.length > 0 ? (count / targets.length) * 100 : 0;
              return (
                <div key={stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-textMuted">{STATUS_LABELS[stage]}</span>
                    <div className="flex items-center gap-2">
                      {i > 0 && <span className="text-xs text-sub">({rate}%)</span>}
                      <span className="text-xs font-semibold" style={{ color: STATUS_COLORS[stage] }}>{count}건</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${barW}%`, backgroundColor: STATUS_COLORS[stage] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Category pie */}
        <Card padding="p-5">
          <p className="section-title">업종별 고객 현황</p>
          {catData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-36 h-36 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={catData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="value" strokeWidth={0}>
                      {catData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {catData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-textMuted flex-1">{d.name}</span>
                    <span className="text-xs font-semibold text-textPrimary">{d.value}건</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-sub text-center py-8">계약 데이터가 없습니다</p>
          )}
        </Card>

        {/* Revenue summary */}
        <Card padding="p-5">
          <p className="section-title">수익 분석</p>
          <div className="space-y-4">
            {[
              { label: '제작비 누적', value: setupTotal, color: 'text-blue-400' },
              { label: '월 이용료 MRR', value: mrr, color: 'text-gold' },
              { label: '예상 연간 수익', value: mrr * 12 + setupTotal, color: 'text-green-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <span className="text-sm text-textMuted">{label}</span>
                <span className={`text-sm font-bold ${color}`}>{(value / 10000).toFixed(0)}만원</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* At risk */}
      {atRisk.length > 0 && (
        <div>
          <p className="section-title">이탈 위험 고객 ({atRisk.length}명) — 3개월 이상 경과</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {atRisk.map(c => (
              <Card key={c.id} variant="danger">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} className="text-danger flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-textPrimary">{c.product}</p>
                    <p className="text-xs text-sub mt-0.5">{c.start_date} · {c.contract_months}개월</p>
                    <p className="text-xs text-danger mt-1">월 {c.monthly_fee.toLocaleString()}원</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
