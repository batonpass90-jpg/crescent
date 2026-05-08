# Meal Insta Bot

자취 식단 인스타그램 카드뉴스 자동 게시 시스템 — 콘텐츠 기획부터 게시까지 사람 개입 0.

소요(자취인 식단앱) 트래픽 유도용. 매일 오전 8시 KST 자동 캐러셀 게시.

## 스택

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS (카드 스타일)
- Puppeteer (HTML → 1080×1350 PNG)
  - 로컬: `puppeteer`
  - Vercel: `puppeteer-core` + `@sparticuz/chromium`
- Supabase Storage (PNG 호스팅)
- Instagram Graph API (캐러셀 게시)
- Vercel Cron (매일 09:00 UTC = 18:00 KST)

## 단계별 진행 현황

- [x] **1단계** — Next.js + 환경변수 템플릿
- [x] **2단계** — 콘텐츠: 소요 RECIPES 정적 데이터 + `recipeToCards()` 결정론적 변환
- [x] **2.5단계** — 카드 컴포넌트 (V4+V5 하이브리드, `/preview`)
- [x] **2.6단계** — 소요 앱 디자인 토큰 동기화 (`lib/soyo-tokens.ts`)
- [x] **3단계** — Puppeteer 캡처 (`lib/screenshot.ts`, `/render`)
- [x] **4단계** — Instagram Graph API (`lib/instagram.ts`, `/api/publish`)
- [x] **5단계** — Vercel Cron (`/api/cron/daily-publish`, `vercel.json`)
- [ ] **6단계** — 게시 히스토리 DB 기록 + 모니터링

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/preview` | 카드 시안 미리보기 (V4+V5 하이브리드) |
| GET | `/render?source=recipe:1&i=0` | 단일 카드 1080×1350 native 렌더 (Puppeteer 전용) |
| POST | `/api/publish` | recipeId → 캡처·업로드·게시 일괄 (`?dryRun=1`로 IG 생략) |
| GET | `/api/cron/daily-publish` | Vercel Cron 진입점 (매일 18:00 KST) |

## 셋업

### 1) 인프라 발급

| # | 항목 | 어디서 |
|---|------|-------|
| 1 | Instagram **Business/Creator** 계정 | 인스타 앱 → 일반 → 비즈니스 전환 |
| 2 | Facebook 페이지 + Developer 앱 | developers.facebook.com → 앱 만들기 → "비즈니스" 유형 → Instagram Graph API 제품 추가 |
| 3 | `IG_ACCESS_TOKEN` (60일 장기) | Graph API Explorer → 단기 토큰 → `oauth/access_token`으로 장기 교환 |
| 4 | `IG_USER_ID` | `GET /me/accounts?fields=instagram_business_account` |
| 5 | Supabase 프로젝트 + Storage 버킷 | supabase.com → New project → Storage → Bucket `card-images` (Public) |
| 6 | Vercel 계정 | vercel.com → New Project (이 repo 연결) |

### 2) 로컬 개발

```bash
cd meal-insta-bot
cp .env.example .env.local
# .env.local 채우기 (위 1~6번 값)
npm install
npm run dev
# http://localhost:3000/preview
```

### 3) 게시 테스트 (로컬)

```bash
# 단일 레시피 1회 게시
curl -X POST http://localhost:3000/api/publish \
  -H "content-type: application/json" \
  -H "x-cron-secret: $CRON_SECRET" \
  -d '{"recipeId":"1"}'
```

응답:
```json
{
  "ok": true,
  "postId": "17xxx_18xxx",
  "recipe": { "id": "1", "name": "계란후라이덮밥" },
  "cardCount": 8,
  "urls": ["https://xxx.supabase.co/.../card-00.png", ...],
  "durationMs": 87234
}
```

### 4) Vercel 배포

```bash
# Vercel CLI 또는 GitHub 연동
vercel --prod

# 환경변수 등록 (Vercel 대시보드 또는 CLI)
vercel env add IG_ACCESS_TOKEN production
vercel env add IG_USER_ID production
vercel env add PUBLIC_BASE_URL production  # https://your-app.vercel.app
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add CRON_SECRET production
vercel env add SLACK_WEBHOOK_URL production  # optional

# 배포 후 cron 자동 등록 (vercel.json의 schedule)
```

### 5) 운영

- 매일 09:00 UTC (18:00 KST) Vercel Cron이 `/api/cron/daily-publish` 호출
- 그날의 레시피 1개 자동 선택 (RECIPES 길이 모듈로 라운드로빈)
- 8장 PNG 캡처 → Supabase 업로드 → 캐러셀 게시
- Slack에 성공/실패 알림 (옵션)
- IG 토큰은 60일마다 갱신 필요

## 주의사항

- **Instagram API**: 하루 게시 한도 25개. 이 봇은 1개/일.
- **자동 좋아요/팔로우 같은 봇 행위 금지** — 정책 위반.
- **캐러셀 처리 시간**: 8장 child + 1 parent = ~30초. `waitContainerReady` 폴링.
- **IG_ACCESS_TOKEN 만료**: 60일. 만료 14일 전 갱신 자동화 권장 (TODO).
- **Supabase Storage 무료 한도**: 1GB. 8장×100KB×365일 ≈ 290MB. OK.
- **Vercel Hobby**: 함수 maxDuration 60s 한계 — Pro 플랜 필요 (300s).
  - 무료로 가려면 Render/Railway에 별도 워커 띄워서 외부에서 트리거.

## 트러블슈팅

| 증상 | 원인 |
|------|------|
| `IG_ACCESS_TOKEN must be set` | `.env.local` 미설정 또는 Vercel env 누락 |
| `Container failed: ERROR` | image_url 접근 불가 (Supabase bucket Public인지 확인) |
| 캡처 PNG가 빈 화면 | Puppeteer가 외부 이미지 로딩 전 캡처 — `waitUntil:networkidle0` 확인 |
| Vercel 배포 시 chromium 에러 | `@sparticuz/chromium` 버전이 puppeteer-core와 호환되는지 |
| 카드 폰트 깨짐 | Pretendard 웹폰트 로드 실패 — 네트워크 차단 환경에선 self-host 필요 |

## 라이선스

비공개 — 소요 앱 운영 전용.
