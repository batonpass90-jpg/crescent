/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "puppeteer-core",
    "@sparticuz/chromium",
    "puppeteer",
  ],
  // Vercel serverless에서 chromium 바이너리·라이브러리(libnss3 등)가
  // 함수 패키지에 포함되도록 명시. 패턴 와일드카드 위치별로 명시.
  outputFileTracingIncludes: {
    "/api/publish": [
      "./node_modules/@sparticuz/chromium/**",
      "./node_modules/@sparticuz/chromium/bin/**",
    ],
    "/api/cron/daily-publish": [
      "./node_modules/@sparticuz/chromium/**",
      "./node_modules/@sparticuz/chromium/bin/**",
    ],
  },
};

module.exports = nextConfig;
