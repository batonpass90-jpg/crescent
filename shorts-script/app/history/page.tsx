import Link from "next/link";
import { listHistory } from "@/lib/supabase";
import { STATUS_LABELS } from "@/lib/status-labels";
import type { JobStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const items = await listHistory();

  return (
    <main className="min-h-screen bg-white px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold text-navy">작업 이력</h1>
          <Link href="/" className="text-sm font-semibold text-crescent hover:underline">
            + 새 대본 만들기
          </Link>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-gray-500">아직 생성된 대본이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-gray-100 border-t border-b border-gray-100">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/jobs/${item.id}`}
                  className="flex items-center justify-between py-4 hover:bg-gray-50 px-2 -mx-2 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-navy">{item.product_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(item.created_at).toLocaleString("ko-KR")}
                      {item.is_longform ? " · 롱폼" : ""}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      item.has_script
                        ? "bg-crescent/10 text-crescent"
                        : item.status === "error" || item.status === "download_failed" || item.status === "timeout"
                          ? "bg-red-50 text-red-600"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {item.has_script ? "대본 완료" : STATUS_LABELS[item.status as JobStatus] ?? item.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
