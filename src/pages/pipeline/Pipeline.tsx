import { useState, useEffect, useCallback } from 'react';
import { X, Phone, MessageSquare, FileText, Plus, ArrowRight } from 'lucide-react';
import Badge from '../../components/Badge';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import { getTargets, updateTargetStatus, getActivities, insertActivity } from '../../lib/supabase';
import { STAGES, STATUS_LABELS, STATUS_COLORS, CATEGORY_LABELS, CATEGORY_COLORS } from '../../lib/constants';
import { Target, Activity, TargetStatus } from '../../types';

export default function Pipeline() {
  const [targets, setTargets] = useState<Record<string, Target[]>>(() =>
    Object.fromEntries(STAGES.map(s => [s, []]))
  );
  const [selected, setSelected] = useState<Target | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const all = await getTargets() as Target[];
      const grouped = Object.fromEntries(STAGES.map(s => [s, [] as Target[]]));
      all.forEach(t => { if (grouped[t.status]) grouped[t.status].push(t); });
      setTargets(grouped);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (t: Target) => {
    setSelected(t);
    try { setActivities(await getActivities(t.id) as Activity[]); }
    catch { setActivities([]); }
  };

  const moveStage = async (t: Target, newStatus: TargetStatus) => {
    try {
      await updateTargetStatus(t.id, newStatus);
      await insertActivity({ target_id: t.id, type: 'memo', note: `단계 변경: ${STATUS_LABELS[t.status]} → ${STATUS_LABELS[newStatus]}`, created_at: new Date().toISOString() });
      setSelected({ ...t, status: newStatus });
      load();
    } catch (e) { alert('업데이트 실패'); }
  };

  const addMemo = async () => {
    if (!selected || !memo.trim()) return;
    try {
      await insertActivity({ target_id: selected.id, type: 'memo', note: memo.trim(), created_at: new Date().toISOString() });
      setMemo('');
      setActivities(await getActivities(selected.id) as Activity[]);
    } catch { alert('메모 저장 실패'); }
  };

  const total = Object.values(targets).flat().length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.06] flex-shrink-0 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-textPrimary">파이프라인</h2>
          <p className="text-xs text-sub mt-0.5">{total}개 업체 관리 중</p>
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex h-full min-w-max">
          {STAGES.map(stage => (
            <div key={stage} className="w-64 flex-shrink-0 flex flex-col border-r border-white/[0.06]">
              {/* Column header */}
              <div className="px-4 py-3 flex items-center gap-2 border-b border-white/[0.06] bg-[#0a0c14] flex-shrink-0">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[stage] }} />
                <span className="text-xs font-semibold text-textMuted flex-1">{STATUS_LABELS[stage]}</span>
                <span className="text-xs text-sub bg-white/5 px-1.5 py-0.5 rounded-full">{targets[stage]?.length || 0}</span>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {loading
                  ? [1, 2].map(i => <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />)
                  : targets[stage]?.map(t => (
                    <div
                      key={t.id}
                      onClick={() => openDetail(t)}
                      className="rounded-xl border border-white/[0.06] bg-[#0d1117] hover:border-white/10 cursor-pointer transition-all group overflow-hidden"
                    >
                      <div
                        className="h-0.5 w-full"
                        style={{ backgroundColor: CATEGORY_COLORS[t.category] || '#64748b' }}
                      />
                      <div className="p-3">
                        <p className="text-sm font-medium text-textPrimary truncate">{t.name}</p>
                        <p className="text-xs text-sub mt-0.5">{CATEGORY_LABELS[t.category as keyof typeof CATEGORY_LABELS] || t.category}</p>
                        {t.monthly_fee ? <p className="text-xs text-gold mt-1">월 {(t.monthly_fee / 10000).toFixed(0)}만원</p> : null}
                        <p className="text-[10px] text-sub mt-1.5">
                          {new Date(t.updated_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))
                }
                {!loading && targets[stage]?.length === 0 && (
                  <p className="text-xs text-sub text-center py-8">없음</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name || ''} width="max-w-2xl">
        {selected && (
          <div className="space-y-5">
            {/* Info */}
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    label={STATUS_LABELS[selected.status]}
                    color={STATUS_COLORS[selected.status]}
                    bg={STATUS_COLORS[selected.status] + '22'}
                    size="md"
                  />
                  <Badge
                    label={CATEGORY_LABELS[selected.category as keyof typeof CATEGORY_LABELS] || selected.category}
                    color={CATEGORY_COLORS[selected.category]}
                    bg={CATEGORY_COLORS[selected.category] + '22'}
                    size="md"
                  />
                </div>
                <div className="space-y-1.5 text-sm">
                  <p className="text-textMuted"><span className="text-sub w-16 inline-block">전화</span>{selected.phone}</p>
                  <p className="text-textMuted"><span className="text-sub w-16 inline-block">주소</span>{selected.address}</p>
                  {selected.monthly_fee && <p className="text-textMuted"><span className="text-sub w-16 inline-block">요금</span>월 {selected.monthly_fee.toLocaleString()}원</p>}
                </div>
              </div>
              {/* Quick actions */}
              <div className="flex gap-2">
                <button className="btn-ghost flex items-center gap-1.5 text-xs py-2 px-3"><Phone size={14} />전화</button>
                <button className="btn-ghost flex items-center gap-1.5 text-xs py-2 px-3"><MessageSquare size={14} />문자</button>
                <button className="btn-ghost flex items-center gap-1.5 text-xs py-2 px-3"><FileText size={14} />견적서</button>
              </div>
            </div>

            {/* Stage move */}
            <div>
              <p className="section-title">단계 이동</p>
              <div className="flex flex-wrap gap-2">
                {STAGES.filter(s => s !== selected.status).map(s => (
                  <button
                    key={s}
                    onClick={() => moveStage(selected, s)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors hover:opacity-80"
                    style={{ borderColor: STATUS_COLORS[s] + '60', color: STATUS_COLORS[s], backgroundColor: STATUS_COLORS[s] + '15' }}
                  >
                    <ArrowRight size={12} />
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Memo */}
            <div>
              <p className="section-title">메모 추가</p>
              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="메모를 입력하세요..."
                  value={memo}
                  onChange={e => setMemo(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addMemo()}
                />
                <button onClick={addMemo} className="btn-primary px-4"><Plus size={16} /></button>
              </div>
            </div>

            {/* Activities */}
            <div>
              <p className="section-title">활동 이력</p>
              {activities.length === 0 ? (
                <p className="text-sm text-sub py-4 text-center">활동 기록이 없습니다</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activities.map(a => (
                    <div key={a.id} className="flex gap-3 py-2 border-b border-white/[0.04] last:border-0">
                      <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                      </div>
                      <div>
                        <p className="text-sm text-textPrimary">{a.note}</p>
                        <p className="text-xs text-sub mt-0.5">{new Date(a.created_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
