"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ResultScreen from "@/components/ResultScreen";
import { ERROR_STATUSES, STATUS_LABELS } from "@/lib/status-labels";
import type { WorkerJob } from "@/lib/types";

const POLL_MS = 2500;

export default function JobStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<WorkerJob | null>(null);
  const [fetchError, setFetchError] = useState("");
  const [candidateError, setCandidateError] = useState("");
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [manualStart, setManualStart] = useState("");
  const [manualEnd, setManualEnd] = useState("");
  const [manualError, setManualError] = useState("");
  const requestedCandidatesRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval>;

    async function poll() {
      try {
        const res = await fetch(`/api/jobs/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.ok) {
          setFetchError(data?.error ?? "작업 조회에 실패했습니다.");
          clearInterval(timer);
          return;
        }
        setJob(data.job);
        // 완료/에러 상태에 도달하면 더 폴링할 필요가 없다.
        if (data.job.status === "ready" || ERROR_STATUSES.includes(data.job.status)) {
          clearInterval(timer);
        }
      } catch {
        if (!cancelled) setFetchError("네트워크 오류가 발생했습니다.");
      }
    }

    poll();
    timer = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [id]);

  useEffect(() => {
    if (
      job?.status === "awaiting_highlight_selection" &&
      !job.highlight_candidates?.length &&
      !requestedCandidatesRef.current
    ) {
      requestedCandidatesRef.current = true;
      setCandidateLoading(true);
      fetch(`/api/jobs/${id}/highlight-candidates`, { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (!data.ok) setCandidateError(data.error ?? "하이라이트 후보 생성에 실패했습니다.");
        })
        .catch(() => setCandidateError("하이라이트 후보 생성 중 오류가 발생했습니다."))
        .finally(() => setCandidateLoading(false));
    }
  }, [job, id]);

  async function selectHighlight(startSec: number, endSec: number) {
    setSelecting(true);
    try {
      const res = await fetch(`/api/jobs/${id}/highlight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start_sec: startSec, end_sec: endSec }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error ?? "하이라이트 확정에 실패했습니다.");
    } catch (e) {
      setCandidateError(e instanceof Error ? e.message : "하이라이트 확정 중 오류가 발생했습니다.");
      setSelecting(false);
    }
  }

  function submitManualHighlight(durationSec: number | null) {
    setManualError("");
    const start = Number(manualStart);
    const end = Number(manualEnd);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start) {
      setManualError("시작/끝 시간을 올바르게 입력해 주세요 (초 단위, 끝이 시작보다 커야 함).");
      return;
    }
    if (durationSec && end > durationSec) {
      setManualError(`영상 길이(${Math.floor(durationSec)}초)를 넘을 수 없습니다.`);
      return;
    }
    selectHighlight(start, end);
  }

  if (fetchError) {
    return <ErrorScreen message={fetchError} />;
  }

  if (!job) {
    return <CenteredMessage>불러오는 중...</CenteredMessage>;
  }

  if (ERROR_STATUSES.includes(job.status)) {
    return <ErrorScreen message={job.error_message ?? "처리 중 오류가 발생했습니다."} />;
  }

  if (job.status === "awaiting_highlight_selection") {
    const candidates = job.highlight_candidates ?? [];
    const best = candidates.reduce(
      (acc, c) => (!acc || c.score > acc.score ? c : acc),
      candidates[0]
    );

    return (
      <main className="min-h-screen bg-white px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-xl font-bold text-navy mb-1">숏폼으로 만들 구간을 골라주세요</h1>
          <p className="text-sm text-gray-500 mb-8">
            영상이 길어(90초 이상) AI가 추천하는 구간 중 하나를 선택하면 그 부분만 잘라서 대본을 만듭니다.
          </p>

          {(candidateLoading || (!candidates.length && !candidateError)) && (
            <CenteredMessage>추천 구간을 분석하는 중...</CenteredMessage>
          )}

          {candidateError && <p className="text-sm text-red-600 mb-4">{candidateError}</p>}

          <div className="space-y-3">
            {candidates.map((c, i) => (
              <div
                key={i}
                className={`border rounded-xl p-5 ${
                  c === best ? "border-crescent bg-crescent/5" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-gray-400">
                    {formatTime(c.start_sec)} ~ {formatTime(c.end_sec)}
                  </span>
                  <span className="text-xs font-semibold text-crescent">점수 {c.score}/10</span>
                </div>
                <p className="text-sm text-navy font-medium mb-1">{c.summary}</p>
                <p className="text-xs text-gray-500 mb-4">{c.reason}</p>
                <button
                  onClick={() => selectHighlight(c.start_sec, c.end_sec)}
                  disabled={selecting}
                  className="w-full rounded-lg bg-crescent px-4 py-2 text-sm font-semibold text-white hover:bg-crescent-light disabled:opacity-50"
                >
                  {c === best ? "이 구간 선택 (가장 추천)" : "이 구간 선택"}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <p className="text-xs font-semibold text-gray-500 mb-3">
              추천 구간이 마음에 안 들면 직접 시작/끝 시간을 입력할 수도 있습니다 (초 단위).
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={manualStart}
                onChange={(e) => setManualStart(e.target.value)}
                placeholder="시작(초)"
                className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <span className="text-gray-400">~</span>
              <input
                type="number"
                min={0}
                value={manualEnd}
                onChange={(e) => setManualEnd(e.target.value)}
                placeholder="끝(초)"
                className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                onClick={() => submitManualHighlight(job.duration_sec)}
                disabled={selecting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-navy hover:bg-gray-50 disabled:opacity-50"
              >
                이 구간으로 진행
              </button>
            </div>
            {manualError && <p className="mt-2 text-xs text-red-600">{manualError}</p>}
          </div>
        </div>
      </main>
    );
  }

  if (job.status === "ready") {
    return <ResultScreen jobId={id} productName={job.product_name} />;
  }

  return (
    <CenteredMessage>
      {STATUS_LABELS[job.status]}
      <span className="block text-xs text-gray-400 mt-2">화면을 벗어나도 처리는 계속됩니다.</span>
    </CenteredMessage>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center text-sm text-gray-500">{children}</div>
    </main>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-sm text-center">
        <p className="text-sm text-red-600 mb-4">{message}</p>
        <Link href="/" className="text-sm font-semibold text-crescent hover:underline">
          처음으로 돌아가기
        </Link>
      </div>
    </main>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
