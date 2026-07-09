"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Mode = "file" | "url";

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("file");
  const [productName, setProductName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!productName.trim()) {
      setError("상품명을 입력해 주세요.");
      return;
    }
    if (mode === "file" && !file) {
      setError("영상 파일을 선택해 주세요.");
      return;
    }
    if (mode === "url" && !sourceUrl.trim()) {
      setError("영상 링크를 입력해 주세요.");
      return;
    }

    setLoading(true);
    try {
      let jobId: string;

      if (mode === "file" && file) {
        const workerBase = process.env.NEXT_PUBLIC_WORKER_BASE_URL;
        const uploadToken = process.env.NEXT_PUBLIC_WORKER_UPLOAD_TOKEN;
        if (!workerBase || !uploadToken) {
          throw new Error("워커 서버 설정이 되어 있지 않습니다. 관리자에게 문의해 주세요.");
        }

        const form = new FormData();
        form.set("product_name", productName.trim());
        form.set("file", file);

        const res = await fetch(`${workerBase.replace(/\/$/, "")}/jobs`, {
          method: "POST",
          headers: { "X-Worker-Secret": uploadToken },
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.detail ?? "업로드에 실패했습니다.");
        jobId = data.job_id;
      } else {
        const res = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_name: productName.trim(), source_url: sourceUrl.trim() }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data?.error ?? "요청에 실패했습니다.");
        jobId = data.job_id;
      }

      router.push(`/jobs/${jobId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white px-4 py-16">
      <div className="mx-auto max-w-xl">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-navy">쇼츠 대본 생성기</h1>
          <p className="mt-2 text-gray-500">
            영상과 상품명만 입력하면 후킹 쇼츠 대본을 자동으로 만들어 드립니다.
          </p>
          <Link href="/history" className="mt-3 inline-block text-sm font-medium text-crescent hover:underline">
            지난 작업 이력 보기
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-2xl p-8 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-medium text-navy mb-2">상품명</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="예: 크레센트 립밤"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-crescent"
            />
          </div>

          <div>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setMode("file")}
                className={`flex-1 rounded-lg py-2 text-sm font-medium border ${
                  mode === "file" ? "bg-crescent text-white border-crescent" : "border-gray-300 text-gray-500"
                }`}
              >
                파일 업로드
              </button>
              <button
                type="button"
                onClick={() => setMode("url")}
                className={`flex-1 rounded-lg py-2 text-sm font-medium border ${
                  mode === "url" ? "bg-crescent text-white border-crescent" : "border-gray-300 text-gray-500"
                }`}
              >
                영상 링크
              </button>
            </div>

            {mode === "file" ? (
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm"
              />
            ) : (
              <input
                type="text"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="유튜브/틱톡 등 영상 링크"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-crescent"
              />
            )}
            <p className="mt-2 text-xs text-gray-400">
              샤오홍슈는 로그인 필요 콘텐츠가 많아 다운로드가 안 될 수 있습니다 — 이 경우 파일을 직접 업로드해 주세요.
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-crescent px-4 py-2.5 text-sm font-semibold text-white hover:bg-crescent-light disabled:opacity-50"
          >
            {loading ? "제출 중..." : "대본 생성 시작"}
          </button>
        </form>
      </div>
    </main>
  );
}
