/**
 * Puppeteer로 /render 라우트를 1080×1350 PNG로 캡처.
 *
 * 환경별 분기:
 * - 로컬 (NODE_ENV=development): `puppeteer` (자체 chromium 다운로드)
 * - Vercel (NODE_ENV=production):  `puppeteer-core` + `@sparticuz/chromium`
 *
 * 호출:
 *   const png = await captureCard("recipe:1", 0);
 *   // → Buffer (image/png, 1080×1350)
 */

import { CARD_WIDTH, CARD_HEIGHT } from "@/components/CardTemplate";

const isProd = process.env.NODE_ENV === "production";

interface CaptureOptions {
  /** "recipe:1" or "sample:today_meal" */
  source: string;
  /** 카드 인덱스 (0..n-1) */
  index: number;
  /** 인스타 핸들 (default: SoyoLinks.instagramHandle) */
  handle?: string;
  /** 베이스 URL (default: PUBLIC_BASE_URL env or http://localhost:3000) */
  baseUrl?: string;
}

export async function captureCard({
  source,
  index,
  handle,
  baseUrl,
}: CaptureOptions): Promise<Buffer> {
  const base = baseUrl ?? process.env.PUBLIC_BASE_URL ?? "http://localhost:3000";
  const params = new URLSearchParams({ source, i: String(index) });
  if (handle) params.set("handle", handle);
  const url = `${base}/render?${params.toString()}`;

  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    // 1080×1350 정확히 (deviceScaleFactor 1로 픽셀 일치)
    await page.setViewport({
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      deviceScaleFactor: 1,
    });

    // 외부 이미지(Wikimedia/Unsplash) 로딩 대기
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30_000 });

    // body 마진 0 강제 (Next.js global css가 어떻든 카드만 크롭)
    await page.addStyleTag({
      content: "html,body{margin:0!important;padding:0!important;}",
    });

    // #card-frame 요소가 정확히 1080×1350인지 보장
    const frame = await page.$("#card-frame");
    if (!frame) {
      throw new Error("#card-frame element not found in /render output");
    }

    const buffer = (await frame.screenshot({
      type: "png",
      omitBackground: false,
    })) as Buffer;

    return buffer;
  } finally {
    await browser.close();
  }
}

async function launchBrowser() {
  if (isProd) {
    // Vercel/Lambda — @sparticuz/chromium v131+ 권장 패턴
    const [{ default: puppeteerCore }, { default: chromium }] =
      await Promise.all([
        import("puppeteer-core"),
        import("@sparticuz/chromium"),
      ]);
    // 폰트 로딩 활성화 (한글 깨짐 방지)
    await chromium.font(
      "https://raw.githubusercontent.com/googlefonts/noto-cjk/main/Sans/OTF/Korean/NotoSansCJKkr-Regular.otf",
    );
    return puppeteerCore.launch({
      args: [
        ...chromium.args,
        "--hide-scrollbars",
        "--disable-web-security",
      ],
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      defaultViewport: { width: CARD_WIDTH, height: CARD_HEIGHT },
    });
  }
  // 로컬 — full puppeteer
  const { default: puppeteer } = await import("puppeteer");
  return puppeteer.launch({
    headless: true,
    defaultViewport: { width: CARD_WIDTH, height: CARD_HEIGHT },
  });
}

/**
 * 한 데크 전체(8장)를 한 번의 브라우저 세션에서 순차 캡처.
 * 브라우저 launch/close는 1회만 → 8장 ~30~60초.
 * 카드별 page는 새로 만들어서 상태 격리.
 */
export async function captureDeck(opts: {
  source: string;
  cardCount: number;
  handle?: string;
  baseUrl?: string;
}): Promise<Buffer[]> {
  const base = opts.baseUrl ?? process.env.PUBLIC_BASE_URL ?? "http://localhost:3000";
  const browser = await launchBrowser();
  const buffers: Buffer[] = [];
  let closed = false;
  try {
    for (let i = 0; i < opts.cardCount; i++) {
      const params = new URLSearchParams({ source: opts.source, i: String(i) });
      if (opts.handle) params.set("handle", opts.handle);
      const url = `${base}/render?${params.toString()}`;

      const page = await browser.newPage();
      try {
        await page.setViewport({
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          deviceScaleFactor: 1,
        });
        // 커버(i=0)에만 외부 이미지 → networkidle0 필요
        // 본문(i>=1)은 외부 이미지 없음 → load면 충분
        const waitUntil = i === 0 ? "networkidle0" : "load";
        await page.goto(url, { waitUntil, timeout: 30_000 });
        await page.addStyleTag({
          content: "html,body{margin:0!important;padding:0!important;}",
        });
        const frame = await page.$("#card-frame");
        if (!frame) throw new Error(`#card-frame missing at i=${i}`);
        const buf = (await frame.screenshot({ type: "png" })) as Buffer;
        buffers.push(buf);
        console.log(`[capture] ${opts.source} #${i} → ${(buf.length / 1024).toFixed(0)}KB`);
      } finally {
        await page.close();
      }
    }
  } finally {
    // Windows에서 browser.close()가 종종 hang — 타임아웃 race로 진행 보장
    if (!closed) {
      closed = true;
      Promise.race([
        browser.close(),
        new Promise((r) => setTimeout(r, 5_000)),
      ]).catch(() => {});
    }
  }
  return buffers;
}
