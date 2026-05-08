export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900">
          Meal Insta Bot
        </h1>
        <p className="mt-2 text-neutral-600">
          소요 자취 식단 인스타 카드뉴스 자동 게시
        </p>
        <div className="mt-6 text-left text-sm text-neutral-700 max-w-md mx-auto">
          <ul className="list-disc list-inside space-y-1">
            <li>
              GET <code>/preview</code> — 카드 시안 미리보기
            </li>
            <li>
              GET <code>/render?source=recipe:1&i=0</code> — 단일 카드 native 렌더
            </li>
            <li>
              POST <code>/api/publish</code> — 캡처·업로드·게시 일괄
            </li>
            <li>
              GET <code>/api/cron/daily-publish</code> — 매일 18:00 KST 자동
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
