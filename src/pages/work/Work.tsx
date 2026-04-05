import { useState, useEffect } from 'react';
import { FileText, PenLine, Receipt, Package, Bell, Rocket, BarChart2, Plus, X, Download } from 'lucide-react';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { getTargets, getQuotes, upsertQuote, getContracts, getTasks } from '../../lib/supabase';
import { PRODUCTS, ADDONS } from '../../lib/constants';
import { Target, Quote, Contract } from '../../types';

type BotId = 'quote' | 'contract' | 'tax' | 'delivery' | 'billing' | 'onboarding' | 'report';

const BOTS: { id: BotId; icon: typeof FileText; label: string; sub: string }[] = [
  { id: 'quote',      icon: FileText,  label: '견적봇',   sub: '견적서 생성 및 발송' },
  { id: 'contract',   icon: PenLine,   label: '계약봇',   sub: '계약서 작성 및 서명' },
  { id: 'tax',        icon: Receipt,   label: '세금봇',   sub: '세금계산서 발행' },
  { id: 'delivery',   icon: Package,   label: '납품봇',   sub: '프로젝트 진행 관리' },
  { id: 'billing',    icon: Bell,      label: '청구봇',   sub: '월 청구 자동화' },
  { id: 'onboarding', icon: Rocket,    label: '온보딩봇', sub: '신규 계약 온보딩' },
  { id: 'report',     icon: BarChart2, label: '정산봇',   sub: '월간 정산 보고서' },
];

const DELIVERY_STEPS = ['DB 설계 완료', '로그인 구현', '핵심 기능 구현', '디자인 적용', '테스트 완료', '고객 교육', '배포 완료', '도메인 연결'];
const ONBOARDING_STEPS = ['계약서 서명 확인', '계약금 입금 확인', '킥오프 미팅 예약', '브랜드 자료 수집', '개발 시작 알림 발송', '중간 보고', '납품 전 최종 확인'];

export default function Work() {
  const [activeBot, setActiveBot] = useState<BotId | null>(null);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-textPrimary">실무 자동화</h2>
        <p className="text-sub text-sm mt-1">7가지 자동화 직원</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {BOTS.map(({ id, icon: Icon, label, sub }) => (
          <button
            key={id}
            onClick={() => setActiveBot(id)}
            className="card p-5 flex flex-col items-center gap-3 hover:border-white/10 hover:bg-white/[0.02] transition-all group text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/15 transition-colors">
              <Icon size={22} className="text-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold text-textPrimary">{label}</p>
              <p className="text-xs text-sub mt-0.5">{sub}</p>
            </div>
          </button>
        ))}
      </div>

      {activeBot === 'quote'      && <QuoteBot      onClose={() => setActiveBot(null)} />}
      {activeBot === 'contract'   && <ContractBot   onClose={() => setActiveBot(null)} />}
      {activeBot === 'delivery'   && <DeliveryBot   onClose={() => setActiveBot(null)} />}
      {activeBot === 'billing'    && <BillingBot    onClose={() => setActiveBot(null)} />}
      {activeBot === 'onboarding' && <OnboardingBot onClose={() => setActiveBot(null)} />}
      {activeBot === 'report'     && <ReportBot     onClose={() => setActiveBot(null)} />}
      {activeBot === 'tax'        && <TaxBot        onClose={() => setActiveBot(null)} />}
    </div>
  );
}

// ── Quote Bot ────────────────────────────────────────────────────────────────
function QuoteBot({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'new' | 'list'>('new');
  const [targets, setTargets] = useState<Target[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);
  const [product, setProduct] = useState('BeautyOn');
  const [tier, setTier] = useState<'web' | 'native'>('web');
  const [setupFee, setSetupFee] = useState('990000');
  const [monthlyFee, setMonthlyFee] = useState('99000');
  const [months, setMonths] = useState('12');
  const [addons, setAddons] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      getTargets('consulting').then(d => getTargets('replied').then(r => setTargets([...(d as Target[]), ...(r as Target[])]))),
      getQuotes().then(d => setQuotes(d as Quote[])),
    ]).catch(() => {});
  }, []);

  const addonTotal = Object.entries(addons).filter(([, v]) => v).reduce((s, [k]) => s + ADDONS[k], 0);
  const setup = Number(setupFee) || 0;
  const monthly = Number(monthlyFee) || 0;
  const mo = Number(months) || 12;
  const total = setup + monthly * mo + addonTotal;

  const handleCreate = async () => {
    if (!selectedTarget) return alert('고객을 선택하세요');
    setLoading(true);
    try {
      await upsertQuote({ target_id: selectedTarget.id, product, tier, setup_fee: setup, monthly_fee: monthly, months: mo, addons: Object.fromEntries(Object.entries(addons).filter(([, v]) => v).map(([k]) => [k, ADDONS[k]])), total, status: 'draft', created_at: new Date().toISOString() });
      alert('견적서가 생성되었습니다');
      setQuotes(await getQuotes() as Quote[]);
      setTab('list');
    } catch (e: unknown) { alert(e instanceof Error ? e.message : '생성 실패'); }
    finally { setLoading(false); }
  };

  return (
    <Modal open title="견적봇" onClose={onClose} width="max-w-3xl">
      <div className="flex border-b border-white/[0.06] -mx-6 -mt-6 px-6 mb-6">
        {(['new', 'list'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-gold text-gold' : 'border-transparent text-sub hover:text-textPrimary'}`}>
            {t === 'new' ? '새 견적 만들기' : `견적 목록 (${quotes.length})`}
          </button>
        ))}
      </div>

      {tab === 'new' ? (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="section-title">고객 선택</p>
              <select className="input" value={selectedTarget?.id || ''} onChange={e => setSelectedTarget(targets.find(t => t.id === e.target.value) || null)}>
                <option value="">고객 선택...</option>
                {targets.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <p className="section-title">On 시리즈</p>
              <div className="flex flex-wrap gap-2">
                {PRODUCTS.map(p => <button key={p} onClick={() => setProduct(p)} className={`chip ${product === p ? 'active' : ''}`}>{p}</button>)}
              </div>
            </div>
            <div>
              <p className="section-title">앱 유형</p>
              <div className="flex gap-2">
                {(['web', 'native'] as const).map(t => (
                  <button key={t} onClick={() => setTier(t)} className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-colors ${tier === t ? 'border-gold/40 text-gold bg-gold/10' : 'border-white/[0.06] text-sub hover:text-textPrimary'}`}>
                    {t === 'web' ? '웹앱' : '네이티브앱'}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="section-title">초기 세팅비</p><input className="input" value={setupFee} onChange={e => setSetupFee(e.target.value)} /></div>
              <div><p className="section-title">월 이용료</p><input className="input" value={monthlyFee} onChange={e => setMonthlyFee(e.target.value)} /></div>
            </div>
            <div><p className="section-title">계약 기간(월)</p><input className="input" value={months} onChange={e => setMonths(e.target.value)} /></div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="section-title">애드온 옵션</p>
              <div className="space-y-2">
                {Object.entries(ADDONS).map(([name, price]) => (
                  <label key={name} className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] hover:border-white/10 cursor-pointer transition-colors">
                    <div>
                      <p className="text-sm text-textPrimary">{name}</p>
                      <p className="text-xs text-sub">+{price.toLocaleString()}원/월</p>
                    </div>
                    <input type="checkbox" checked={!!addons[name]} onChange={e => setAddons(p => ({ ...p, [name]: e.target.checked }))} className="w-4 h-4 accent-gold" />
                  </label>
                ))}
              </div>
            </div>
            <Card variant="gold">
              <p className="text-xs text-sub mb-1">총 견적 금액</p>
              <p className="text-3xl font-bold text-gold">{total.toLocaleString()}원</p>
              <p className="text-xs text-sub mt-1">세팅비 {setup.toLocaleString()} + 월 {monthly.toLocaleString()} × {mo}개월 + 옵션 {addonTotal.toLocaleString()}</p>
            </Card>
            <button onClick={handleCreate} disabled={loading} className="btn-primary w-full">
              {loading ? '생성 중...' : '견적서 생성'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map(q => (
            <Card key={q.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-textPrimary">{q.product}</p>
                  <p className="text-sm text-gold mt-0.5">{q.total.toLocaleString()}원</p>
                  <p className="text-xs text-sub mt-0.5">{new Date(q.created_at).toLocaleDateString('ko-KR')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge label={q.status === 'draft' ? '초안' : q.status === 'sent' ? '발송됨' : q.status === 'approved' ? '승인' : '거절'} color={q.status === 'approved' ? '#22c55e' : q.status === 'rejected' ? '#ef4444' : '#f5c518'} bg={q.status === 'approved' ? 'rgba(34,197,94,0.1)' : q.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(245,197,24,0.1)'} size="md" />
                  <button className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1"><Download size={12} />PDF</button>
                </div>
              </div>
            </Card>
          ))}
          {quotes.length === 0 && <p className="text-sm text-sub text-center py-8">견적서가 없습니다</p>}
        </div>
      )}
    </Modal>
  );
}

// ── Contract Bot ─────────────────────────────────────────────────────────────
function ContractBot({ onClose }: { onClose: () => void }) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  useEffect(() => { getContracts().then(d => setContracts(d as Contract[])).catch(() => {}); }, []);
  const active = contracts.filter(c => c.status === 'active');
  return (
    <Modal open title="계약봇" onClose={onClose}>
      <p className="section-title">활성 계약 ({active.length})</p>
      {active.map(c => (
        <Card key={c.id} className="mb-3">
          <p className="font-medium text-textPrimary">{c.product}</p>
          <p className="text-sm text-gold mt-0.5">월 {c.monthly_fee.toLocaleString()}원</p>
          <p className="text-xs text-sub mt-0.5">{c.start_date} 시작 · {c.contract_months}개월</p>
        </Card>
      ))}
      {active.length === 0 && <p className="text-sm text-sub text-center py-8">활성 계약이 없습니다</p>}
    </Modal>
  );
}

// ── Delivery Bot ─────────────────────────────────────────────────────────────
function DeliveryBot({ onClose }: { onClose: () => void }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  return (
    <Modal open title="납품봇" onClose={onClose}>
      <p className="section-title">기본 납품 체크리스트</p>
      <div className="space-y-2">
        {DELIVERY_STEPS.map((step, i) => (
          <label key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] hover:border-white/10 cursor-pointer transition-colors">
            <input type="checkbox" checked={!!checked[i]} onChange={e => setChecked(p => ({ ...p, [i]: e.target.checked }))} className="w-4 h-4 accent-gold" />
            <span className={`text-sm ${checked[i] ? 'line-through text-sub' : 'text-textPrimary'}`}>{step}</span>
          </label>
        ))}
      </div>
      <p className="text-xs text-sub text-right mt-3">{Object.values(checked).filter(Boolean).length}/{DELIVERY_STEPS.length} 완료</p>
    </Modal>
  );
}

// ── Billing Bot ──────────────────────────────────────────────────────────────
function BillingBot({ onClose }: { onClose: () => void }) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  useEffect(() => { getContracts().then(d => setContracts(d as Contract[])).catch(() => {}); }, []);
  const active = contracts.filter(c => c.status === 'active');
  const mrr = active.reduce((s, c) => s + c.monthly_fee, 0);
  return (
    <Modal open title="청구봇" onClose={onClose}>
      <Card variant="gold" className="mb-6">
        <p className="text-xs text-sub mb-1">이번 달 총 청구액</p>
        <p className="text-3xl font-bold text-gold">{mrr.toLocaleString()}원</p>
        <p className="text-xs text-sub mt-1">{active.length}개 계약</p>
      </Card>
      <div className="flex items-center justify-between mb-3">
        <p className="section-title mb-0">청구 목록</p>
        <button className="btn-primary text-sm py-1.5">일괄 발송</button>
      </div>
      <div className="space-y-2">
        {active.map(c => (
          <Card key={c.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-textPrimary">{c.product}</p>
                <p className="text-xs text-gold">{c.monthly_fee.toLocaleString()}원</p>
              </div>
              <Badge label="발송 대기" color="#f97316" bg="rgba(249,115,22,0.1)" size="md" />
            </div>
          </Card>
        ))}
        {active.length === 0 && <p className="text-sm text-sub text-center py-6">활성 계약이 없습니다</p>}
      </div>
    </Modal>
  );
}

// ── Onboarding Bot ───────────────────────────────────────────────────────────
function OnboardingBot({ onClose }: { onClose: () => void }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  return (
    <Modal open title="온보딩봇" onClose={onClose}>
      <div className="space-y-2">
        {ONBOARDING_STEPS.map((step, i) => (
          <label key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] hover:border-white/10 cursor-pointer transition-colors">
            <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-gold">{i + 1}</div>
            <input type="checkbox" checked={!!checked[i]} onChange={e => setChecked(p => ({ ...p, [i]: e.target.checked }))} className="w-4 h-4 accent-gold" />
            <span className={`text-sm ${checked[i] ? 'line-through text-sub' : 'text-textPrimary'}`}>{step}</span>
          </label>
        ))}
      </div>
    </Modal>
  );
}

// ── Report Bot ───────────────────────────────────────────────────────────────
function ReportBot({ onClose }: { onClose: () => void }) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  useEffect(() => { getContracts().then(d => setContracts(d as Contract[])).catch(() => {}); }, []);
  const mrr = contracts.filter(c => c.status === 'active').reduce((s, c) => s + c.monthly_fee, 0);
  const setup = contracts.reduce((s, c) => s + c.setup_fee, 0);
  return (
    <Modal open title="정산봇" onClose={onClose}>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card variant="gold"><p className="text-xs text-sub mb-1">이달 MRR</p><p className="text-2xl font-bold text-gold">{(mrr / 10000).toFixed(0)}만원</p></Card>
        <Card><p className="text-xs text-sub mb-1">제작비 누적</p><p className="text-2xl font-bold text-textPrimary">{(setup / 10000).toFixed(0)}만원</p></Card>
        <Card><p className="text-xs text-sub mb-1">예상 연간</p><p className="text-2xl font-bold text-textPrimary">{(mrr * 12 / 10000).toFixed(0)}만원</p></Card>
        <Card><p className="text-xs text-sub mb-1">활성 계약</p><p className="text-2xl font-bold text-textPrimary">{contracts.filter(c => c.status === 'active').length}건</p></Card>
      </div>
      <button className="btn-secondary w-full flex items-center justify-center gap-2"><Download size={16} />월간 보고서 PDF 생성</button>
    </Modal>
  );
}

function TaxBot({ onClose }: { onClose: () => void }) {
  return (
    <Modal open title="세금봇" onClose={onClose}>
      <p className="text-sm text-sub text-center py-8">이번 달 발행 내역이 없습니다</p>
      <button className="btn-primary w-full">수동 발행</button>
    </Modal>
  );
}
