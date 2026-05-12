/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "puppeteer-core",
    "@sparticuz/chromium",
    "puppeteer",
  ],
  // Vercel serverless에서 chromium 바이너리·라이브러리(libnss3 등)가
  // 함수 패키지에 포함되도록 명시. 없으면 "libnss3.so: cannot open" 에러.
  outputFileTracingIncludes: {
    "/api/publish": ["./node_modules/@sparticuz/chromium/**/*"],
    "/api/cron/daily-publish": [
      "./node_modules/@sparticuz/chromium/**/*",
    ],
  },
};

module.exports = nextConfig;
