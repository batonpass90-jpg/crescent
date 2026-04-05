import { useState, useEffect } from 'react';
import { Search, Send, FileText, CheckCircle, XCircle, Loader2, ChevronDown } from 'lucide-react';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { getTemplates } from '../../lib/supabase';
import { DEFAULT_TEMPLATES, CATEGORY_LABELS, CATEGORY_COLORS } from '../../lib/constants';
import { Template } from '../../types';

type Tab = 'search' | 'send' | 'templates';
type Category = keyof typeof CATEGORY_LABELS;

const CITIES = ['서울특별시', '경기도', '부산광역시', '대구광역시', '인천광역시', '광주광역시', '대전광역시'];
const CATEGORY_KEYWORDS: Record<string, string> = {
  BeautyOn: '미용실', CarOn: '자동차정비', EduOn: '학원', ReviewOn: '식당', CareOn: '요양원', InsureOn: '보험', FactoryOn: '제조업',
};

interface SearchResult { name: string; phone: string; address: string; selected: boolean; }

export default function Sales() {
  const [tab, setTab] = useState<Tab>('search');
  const [category, setCategory] = useState<Category>('BeautyOn');
  const [city, setCity] = useState('서울특별시');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [sendList, setSendList] = useState<SearchResult[]>([]);
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES as Template[]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState({ done: 0, total: 0 });
  const [showTplDropdown, setShowTplDropdown] = useState(false);

  const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

  useEffect(() => {
    getTemplates(category).then(data => {
      if (data && data.length > 0) setTemplates(data as Template[]);
      else setTemplates(DEFAULT_TEMPLATES.filter(t => t.category === category) as Template[]);
    }).catch(() => {
      setTemplates(DEFAULT_TEMPLATES.filter(t => t.category === category) as Template[]);
    });
  }, [category]);

  const handleSearch = async () => {
    setSearching(true);
    // 공공데이터 API 연동 — 현재는 데모 데이터
    await new Promise(r => setTimeout(r, 1200));
    const demo: SearchResult[] = Array.from({ length: 12 }, (_, i) => ({
      name: `${CATEGORY_KEYWORDS[category]}${i + 1}호점`,
      phone: `010-${String(1000 + i * 37).padStart(4, '0')}-${String(2000 + i * 53).padStart(4, '0')}`,
      address: `${city} 강남구 테헤란로 ${(i + 1) * 10}번지`,
      selected: false,
    }));
    setResults(demo);
    setSearching(false);
  };

  const toggleSelect = (idx: number) => {
    setResults(p => {
      const updated = [...p];
      updated[idx] = { ...updated[idx], selected: !updated[idx].selected };
      return updated;
    });
    const item = results[idx];
    if (!item.selected) {
      setSendList(p => p.find(x => x.phone === item.phone) ? p : [...p, { ...item, selected: true }]);
    } else {
      setSendList(p => p.filter(x => x.phone !== item.phone));
    }
  };

  const fillTemplate = (tpl: string, name: string) => tpl.replace(/\{업체명\}/g, name);

  const handleSend = async () => {
    if (!selectedTemplate || sendList.length === 0) return;
    if (!confirm(`${sendList.length}건을 발송하시겠습니까?`)) return;
    setSending(true);
    setSendProgress({ done: 0, total: sendList.length });
    for (let i = 0; i < sendList.length; i++) {
      await new Promise(r => setTimeout(r, 80));
      setSendProgress({ done: i + 1, total: sendList.length });
    }
    setSending(false);
    alert(`발송 완료: ${sendList.length}건`);
  };

  const preview = selectedTemplate && sendList[0]
    ? fillTemplate(selectedTemplate.content, sendList[0].name)
    : selectedTemplate?.content.replace(/\{업체명\}/g, '업체명') || '';

  return (
    <div className="h-full flex flex-col">
      {/* Tab bar */}
      <div className="flex border-b border-white/[0.06] bg-[#0a0c14] flex-shrink-0">
        {(['search', 'send', 'templates'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${tab === t ? 'border-gold text-gold' : 'border-transparent text-sub hover:text-textPrimary'}`}
          >
            {t === 'search' ? '타겟 서칭' : t === 'send' ? `문자 발송 ${sendList.length > 0 ? `(${sendList.length})` : ''}` : '템플릿 관리'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* ── Search ── */}
        {tab === 'search' && (
          <div className="max-w-3xl">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="section-title">업종 선택</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`chip ${category === cat ? 'active' : ''}`}
                      style={category === cat ? { borderColor: CATEGORY_COLORS[cat] + '60', color: CATEGORY_COLORS[cat], backgroundColor: CATEGORY_COLORS[cat] + '15' } : {}}
                    >
                      {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="section-title">지역 선택</p>
                <div className="flex flex-wrap gap-2">
                  {CITIES.map(c => (
                    <button key={c} onClick={() => setCity(c)} className={`chip ${city === c ? 'active' : ''}`}>
                      {c.replace('특별시', '').replace('광역시', '').replace('도', '').trim()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={handleSearch} disabled={searching} className="btn-primary flex items-center gap-2 mb-6">
              {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {searching ? '서칭 중...' : '서칭 시작'}
            </button>

            {results.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-sub">{results.length}개 업체 발견</p>
                  <button
                    onClick={() => {
                      const unselected = results.filter(r => !r.selected);
                      setResults(p => p.map(r => ({ ...r, selected: true })));
                      setSendList(p => {
                        const existing = new Set(p.map(x => x.phone));
                        return [...p, ...unselected.filter(r => !existing.has(r.phone))];
                      });
                    }}
                    className="text-xs text-gold hover:underline"
                  >
                    전체 선택
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {results.map((r, i) => (
                    <div
                      key={r.phone}
                      onClick={() => toggleSelect(i)}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${r.selected ? 'border-success/40 bg-success/5' : 'border-white/[0.06] bg-[#0d1117] hover:border-white/10'}`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors ${r.selected ? 'bg-success border-success' : 'border-sub'}`}>
                        {r.selected && <CheckCircle size={12} className="text-bg" fill="currentColor" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-textPrimary truncate">{r.name}</p>
                        <p className="text-xs text-sub truncate">{r.address}</p>
                        <p className="text-xs text-textMuted">{r.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {sendList.length > 0 && (
                  <div className="mt-4 p-4 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-between">
                    <span className="text-sm text-gold font-medium">{sendList.length}건 선택됨</span>
                    <button onClick={() => setTab('send')} className="btn-primary text-sm py-1.5">문자 발송으로 →</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Send ── */}
        {tab === 'send' && (
          <div className="max-w-2xl">
            <div className="grid grid-cols-2 gap-6">
              {/* Left: list + template */}
              <div>
                <p className="section-title">발송 대상 ({sendList.length}건)</p>
                {sendList.length === 0 ? (
                  <Card className="text-sm text-sub text-center py-6">타겟 서칭에서 업체를 선택하세요</Card>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                    {sendList.map((item, i) => (
                      <div key={item.phone} className="flex items-center gap-2 p-3 rounded-xl border border-white/[0.06] bg-[#0d1117]">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-textPrimary truncate">{item.name}</p>
                          <p className="text-xs text-sub">{item.phone}</p>
                        </div>
                        <button onClick={() => setSendList(p => p.filter((_, idx) => idx !== i))} className="text-sub hover:text-danger transition-colors">
                          <XCircle size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="section-title">템플릿 선택</p>
                <div className="relative">
                  <button
                    onClick={() => setShowTplDropdown(p => !p)}
                    className="w-full input flex items-center justify-between text-left"
                  >
                    <span className={selectedTemplate ? 'text-textPrimary' : 'text-sub'}>
                      {selectedTemplate ? selectedTemplate.name : '템플릿 선택...'}
                    </span>
                    <ChevronDown size={16} className="text-sub flex-shrink-0" />
                  </button>
                  {showTplDropdown && (
                    <div className="absolute top-full mt-1 w-full bg-[#0d1117] border border-white/[0.06] rounded-xl shadow-xl z-10 overflow-hidden">
                      {templates.map(tpl => (
                        <button
                          key={tpl.id}
                          onClick={() => { setSelectedTemplate(tpl); setShowTplDropdown(false); }}
                          className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/[0.04] last:border-0"
                        >
                          <p className="text-sm font-medium text-textPrimary">{tpl.name}</p>
                          <p className="text-xs text-sub">{tpl.send_count}회 발송 · 응답률 {tpl.send_count > 0 ? Math.round(tpl.reply_count / tpl.send_count * 100) : 0}%</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: preview */}
              <div>
                <p className="section-title">미리보기</p>
                {selectedTemplate ? (
                  <Card variant="gold" className="mb-4">
                    <pre className="text-sm text-textPrimary whitespace-pre-wrap font-sans leading-relaxed">{preview}</pre>
                    <p className="text-xs text-sub mt-3 text-right">{preview.length}자</p>
                  </Card>
                ) : (
                  <Card className="text-sm text-sub text-center py-8">템플릿을 선택하면 미리보기가 표시됩니다</Card>
                )}

                {sending ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-textPrimary">
                      <Loader2 size={16} className="animate-spin text-gold" />
                      발송 중 {sendProgress.done}/{sendProgress.total}
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold rounded-full transition-all"
                        style={{ width: `${sendProgress.total > 0 ? (sendProgress.done / sendProgress.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={sendList.length === 0 || !selectedTemplate}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Send size={16} />
                    발송 실행 ({sendList.length}건)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Templates ── */}
        {tab === 'templates' && (
          <div className="max-w-2xl">
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.keys(CATEGORY_LABELS).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat as Category)}
                  className={`chip ${category === cat ? 'active' : ''}`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              {templates.map(tpl => (
                <Card key={tpl.id}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-textPrimary">{tpl.name}</p>
                      <p className="text-xs text-sub mt-0.5">{tpl.send_count}회 발송 · 응답 {tpl.reply_count}회</p>
                    </div>
                    <Badge
                      label={`${tpl.send_count > 0 ? Math.round(tpl.reply_count / tpl.send_count * 100) : 0}% 응답률`}
                      color="#22c55e" bg="rgba(34,197,94,0.1)"
                    />
                  </div>
                  <pre className="text-sm text-textMuted whitespace-pre-wrap font-sans leading-relaxed border-t border-white/[0.06] pt-3 mt-2">{tpl.content}</pre>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
