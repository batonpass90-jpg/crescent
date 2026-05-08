export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900">
          Meal Insta Bot
        </h1>
        <p className="mt-2 text-neutral-600">
          자취 식단 카드뉴스 자동 게시 시스템 (1단계: 셋업 완료)
        </p>
        <div className="mt-6 text-left text-sm text-neutral-700 max-w-md mx-auto">
          <ul className="list-disc list-inside space-y-1">
            <li>POST <code>/api/generate-content</code> — 콘텐츠 생성 (2단계)</li>
            <li>POST <code>/api/generate-image</code> — 카드 PNG 생성 (3단계)</li>
            <li>POST <code>/api/publish-instagram</code> — IG 게시 (4단계)</li>
            <li>GET <code>/api/cron/daily-publish</code> — 일일 자동 (5단계)</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
