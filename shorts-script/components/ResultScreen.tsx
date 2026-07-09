"use client";

import { useEffect, useRef, useState } from "react";
import { buildMarkdown, buildPlainText, downloadTextFile } from "@/lib/export";
import type { GeneratedScript, ProductResearch } from "@/lib/types";

type Stage = "researching" | "writing" | "done" | "error";

export default function ResultScreen({ jobId, productName }: { jobId: string; productName: string }) {
  const [stage, setStage] = useState<Stage>("researching");
  const [error, setError] = useState("");
  const [research, setResearch] = useState<ProductResearch | null>(null);
  const [script, setScript] = useState<GeneratedScript | null>(null);
  const [feedback, setFeedback] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState("");
  const startedRef = useRef(false);

  async function runPipeline() {
    setStage("researching");
    setError("");
    try {
      const researchRes = await fetch(`/api/jobs/${jobId}/product-research`, { method: "POST" });
      const researchData = await researchRes.json();
      if (!researchRes.ok || !researchData.ok) {
        throw new Error(researchData?.error ?? "상품 조사에 실패했습니다.");
      }
      setResearch(researchData.research);

      setStage("writing");
      const scriptRes = await fetch(`/api/jobs/${jobId}/script`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ research: researchData.research }),
      });
      const scriptData = await scriptRes.json();
      if (!scriptRes.ok || !scriptData.ok) {
        throw new Error(scriptData?.error ?? "대본 생성에 실패했습니다.");
      }
      setScript(scriptData.script);
      setStage("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.");
      setStage("error");
    }
  }

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    runPipeline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  async function regenerateWithFeedback() {
    if (!research || !script || !feedback.trim()) return;
    setRegenerating(true);
    setRegenerateError("");
    try {
      const res = await fetch(`/api/jobs/${jobId}/script`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ research, feedback, previous_script: script }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data?.error ?? "대본 재생성에 실패했습니다.");
      }
      setScript(data.script);
      setFeedback("");
    } catch (e) {
      setRegenerateError(e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setRegenerating(false);
    }
  }

  if (stage === "researching" || stage === "writing") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center text-sm text-gray-500">
          {stage === "researching" ? "상품을 조사하는 중..." : "대본을 작성하는 중..."}
          <span className="block text-xs text-gray-400 mt-2">화면을 벗어나지 말아 주세요.</span>
        </div>
      </main>
    );
  }

  if (stage === "error") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-sm text-center">
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={runPipeline}
            className="rounded-lg bg-crescent px-4 py-2 text-sm font-semibold text-white hover:bg-crescent-light"
          >
            다시 시도
          </button>
        </div>
      </main>
    );
  }

  if (!research || !script) return null;

  return (
    <main className="min-h-screen bg-white px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-xl font-bold text-navy mb-6">{productName} 쇼츠 대본</h1>

        {research.insufficient_data && (
          <div className="mb-6 rounded-lg border border-highlight bg-highlight/10 px-4 py-3 text-sm text-navy">
            검증 가능한 정보가 부족해 조사 결과가 제한적입니다. 발행 전 사실관계를 직접 확인해 주세요.
          </div>
        )}

        <section className="mb-6 rounded-xl border border-crescent bg-crescent/5 p-6">
          <p className="text-xs font-semibold text-crescent mb-2">후킹 문장 (0~3초)</p>
          <p className="text-lg font-bold text-navy">{script.hook_line}</p>
        </section>

        <section className="mb-8 rounded-xl border border-gray-200 p-6">
          <p className="text-xs font-semibold text-gray-500 mb-3">상품 분석 요약</p>
          <dl className="text-sm space-y-2">
            <div>
              <dt className="text-gray-500 inline">해결하는 문제: </dt>
              <dd className="text-navy inline">{research.problem_solved || "확인 안 됨"}</dd>
            </div>
            <div>
              <dt className="text-gray-500 inline">핵심 셀링포인트: </dt>
              <dd className="text-navy inline">{research.selling_points.join(", ") || "확인 안 됨"}</dd>
            </div>
            <div>
              <dt className="text-gray-500 inline">후기 반복 키워드: </dt>
              <dd className="text-navy inline">{research.review_keywords.join(", ") || "확인 안 됨"}</dd>
            </div>
            {research.verified_numbers.length > 0 && (
              <div>
                <dt className="text-gray-500 inline">검증된 숫자: </dt>
                <dd className="text-navy inline">
                  {research.verified_numbers.map((n) => `${n.label} ${n.value}`).join(", ")}
                </dd>
              </div>
            )}
          </dl>
        </section>

        <section className="mb-8 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 pr-3 font-medium">컷</th>
                <th className="py-2 pr-3 font-medium">타임코드</th>
                <th className="py-2 pr-3 font-medium">화면 설명</th>
                <th className="py-2 pr-3 font-medium">자막/나레이션</th>
                <th className="py-2 pr-3 font-medium">비고</th>
              </tr>
            </thead>
            <tbody>
              {script.script_rows.map((row) => (
                <tr key={row.cut_no} className="border-b border-gray-100 align-top">
                  <td className="py-3 pr-3 text-navy font-semibold">{row.cut_no}</td>
                  <td className="py-3 pr-3 font-mono text-xs text-gray-500">{row.timecode}</td>
                  <td className="py-3 pr-3 text-gray-600">{row.visual}</td>
                  <td className="py-3 pr-3 text-navy font-medium">{row.caption}</td>
                  <td className="py-3 pr-3 text-xs text-gray-500">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mb-8 text-sm text-gray-500 space-y-1">
          <p>예상 러닝타임: 약 {script.estimated_runtime_sec}초</p>
          <p>추천 배경음/템포: {script.bgm_note}</p>
        </section>

        <div className="flex gap-2">
          <button
            onClick={() =>
              downloadTextFile(`${productName}-쇼츠대본.md`, buildMarkdown(productName, research, script))
            }
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-navy hover:bg-gray-50"
          >
            마크다운 다운로드
          </button>
          <button
            onClick={() =>
              downloadTextFile(`${productName}-쇼츠대본.txt`, buildPlainText(productName, research, script))
            }
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-navy hover:bg-gray-50"
          >
            텍스트 다운로드
          </button>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          이 대본은 자동 생성되었습니다. 발행 전 반드시 사람이 최종 검수해 주세요.
        </p>

        <section className="mt-10 border-t border-gray-100 pt-6">
          <p className="text-sm font-semibold text-navy mb-1">마음에 안 드는 부분이 있나요?</p>
          <p className="text-xs text-gray-500 mb-3">
            원하는 방향이나 후킹 문장 아이디어를 적어주시면 그 내용을 반영해서 다시 만듭니다. (예: &quot;후킹 문장을
            가격 얘기로 바꿔줘&quot;, &quot;3번 컷 화면 설명을 더 자세하게&quot;)
          </p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={regenerating}
            placeholder="예: 후킹 문장을 더 자극적으로 바꿔줘"
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-crescent disabled:opacity-50"
          />
          {regenerateError && <p className="mt-2 text-xs text-red-600">{regenerateError}</p>}
          <button
            onClick={regenerateWithFeedback}
            disabled={regenerating || !feedback.trim()}
            className="mt-3 rounded-lg bg-crescent px-4 py-2 text-sm font-semibold text-white hover:bg-crescent-light disabled:opacity-50"
          >
            {regenerating ? "다시 만드는 중..." : "이 피드백으로 다시 만들기"}
          </button>
        </section>
      </div>
    </main>
  );
}
