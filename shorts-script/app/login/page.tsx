"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "로그인에 실패했습니다.");
        return;
      }
      router.replace(searchParams.get("next") || "/");
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-gray-200 rounded-2xl p-8 shadow-sm"
      >
        <h1 className="text-xl font-bold text-navy mb-1">쇼츠 대본 생성기</h1>
        <p className="text-sm text-gray-500 mb-6">Crescent Studio 팀 전용 도구입니다.</p>

        <label className="block text-sm font-medium text-navy mb-2">팀 비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-crescent"
          placeholder="비밀번호 입력"
        />

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || !password}
          className="mt-5 w-full rounded-lg bg-crescent px-4 py-2.5 text-sm font-semibold text-white hover:bg-crescent-light disabled:opacity-50"
        >
          {loading ? "확인 중..." : "입장하기"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
