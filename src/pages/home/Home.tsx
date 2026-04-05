import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquare, FileText, BarChart2, RefreshCw, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import Card from '../../components/Card';
import { getDailyBrief, getTargets, isConfigured } from '../../lib/supabase';
import { Target } from '../../types';

interface Brief { yesterday_sent: number; yesterday_replied: number; active_consulting: number; month_contracts: number; month_mrr: number; }
interface Todo { id: string; label: string; sub: string; path: string; done: boolean; priority: number; }

export default function Home() {
  const navigate = useNavigate();
  const [brief, setBrief] = useState<Brief | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 (${days[today.getDay()]})`;
  const hour = today.getHours();
  const greeting = hour < 12 ? '좋은 아침이에요' : hour < 18 ? '안녕하세요' : '수고하셨어요';
  const replyRate = brief && brief.yesterday_sent > 0
    ? Math.round((brief.yesterday_replied / brief.yesterday_sent) * 100) : 0;

  const load = async () => {
    setLoading(true);
    try {
      const [b, replied, consulting, sent] = await Promise.all([
        getDailyBrief(),
        getTargets('replied'),
        getTargets('consulting'),
        getTargets('sent'),
      ]);
      setBrief(b);
      const items: Todo[] = [];
      (replied as Target[]).slice(0, 3).forEach((t, i) => {
        items.push({ id: `r-${t.id}`, label: `${t.name} — 응답함, 상담 일정 잡기`, sub: t.address, path: '/pipeline', done: false, priority: i });
      });
      (consulting as Target[]).slice(0, 2).forEach((t, i) => {
        items.push({ id: `c-${t.id}`, label: `${t.name} — 견적서 발송 대기`, sub: t.category, path: '/work', done: false, priority: 10 + i });
      });
      if ((sent as Target[]).length > 0) {
        items.push({ id: 'bulk', label: `신규 문자 발송 — ${sent.length}건 대기`, sub: '영업 탭에서 발송', path: '/sales', done: false, priority: 20 });
      }
      setTodos(items.sort((a, b) => a.priority - b.priority));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleTodo = (id: string) => setTodos(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const QUICK = [
    { icon: Search, label: '타겟 서칭', path: '/sales', color: 'text-blue-400' },
    { icon: MessageSquare, label: '문자 발송', path: '/sales', color: 'text-purple-400' },
    { icon: FileText, label: '견적 만들기', path: '/work', color: 'text-green-400' },
    { icon: BarChart2, label: '분석 보고서', path: '/analytics', color: 'text-yellow-400' },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary mb-1">{greeting}, 승훈님 🌙</h1>
          <p className="text-sub text-sm">{dateStr}</p>
        </div>
        <button onClick={load} className="btn-ghost flex items-center gap-2 text-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          새로고침
        </button>
      </div>

      {/* Brief */}
      <div className="mb-8">
        <p className="section-title">오늘의 브리핑</p>
        {!isConfigured ? (
          <Card variant="warning" className="text-sm text-warning">
            Supabase를 연결하면 실시간 브리핑이 표시됩니다. <code className="bg-warning/10 px-1 rounded">.env</code> 파일을 설정해주세요.
          </Card>
        ) : loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />)}
          </div>
        ) : brief ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <BriefCard label="어제 발송" value={`${brief.yesterday_sent}건`} sub={`응답 ${brief.yesterday_replied}건 (${replyRate}%)`} accent="text-blue-400" />
            <BriefCard label="진행 상담" value={`${brief.active_consulting}건`} accent="text-purple-400" />
            <BriefCard label="이달 신규 계약" value={`${brief.month_contracts}건`} accent="text-green-400" />
            <BriefCard label="이달 MRR" value={`${(brief.month_mrr / 10000).toFixed(0)}만원`} accent="text-gold" large />
          </div>
        ) : null}
      </div>

      {/* Todos */}
      <div className="mb-8">
        <p className="section-title">오늘 처리할 것 ({todos.filter(t => !t.done).length})</p>
        {todos.length === 0 && !loading ? (
          <Card className="text-center py-8 text-sub text-sm">모든 할 일을 완료했어요 ✓</Card>
        ) : (
          <div className="space-y-2">
            {todos.map(todo => (
              <div
                key={todo.id}
                className={`flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] bg-[#0d1117] hover:border-white/10 transition-all group cursor-pointer ${todo.done ? 'opacity-40' : ''}`}
                onClick={() => toggleTodo(todo.id)}
              >
                <button onClick={(e) => { e.stopPropagation(); toggleTodo(todo.id); }} className="flex-shrink-0">
                  {todo.done
                    ? <CheckCircle2 size={20} className="text-success" />
                    : <Circle size={20} className="text-sub group-hover:text-textMuted transition-colors" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${todo.done ? 'line-through text-sub' : 'text-textPrimary'}`}>{todo.label}</p>
                  {todo.sub && <p className="text-xs text-sub mt-0.5 truncate">{todo.sub}</p>}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(todo.path); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-sub hover:text-gold"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <p className="section-title">빠른 실행</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK.map(({ icon: Icon, label, path, color }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="card p-4 flex flex-col items-center gap-3 hover:border-white/10 hover:bg-white/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <Icon size={20} className={color} />
              </div>
              <span className="text-xs font-medium text-textMuted group-hover:text-textPrimary transition-colors">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BriefCard({ label, value, sub, accent, large }: { label: string; value: string; sub?: string; accent: string; large?: boolean }) {
  return (
    <Card variant="gold" padding={`p-4 ${large ? 'md:col-span-2' : ''}`} className={large ? 'md:col-span-2' : ''}>
      <p className="text-xs text-sub mb-1">{label}</p>
      <p className={`font-bold text-textPrimary ${large ? 'text-3xl' : 'text-xl'} ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-sub mt-1">{sub}</p>}
    </Card>
  );
}
