# GitHub Actions Cron 셋업 가이드

Vercel cron이 Puppeteer libnss3 호환 문제로 실패 → GitHub Actions Ubuntu runner로 전환.
Vercel은 블로그/render endpoint 호스팅만. 게시 cron은 GitHub.

---

## GitHub Secrets 등록 (1회, 5분)

https://github.com/batonpass90-jpg/crescent/settings/secrets/actions 접속.

**"New repository secret"** 클릭 후 6개 등록:

| 이름 | 값 |
|------|-----|
| `PUBLIC_BASE_URL` | `https://meal-insta-bot.vercel.app` |
| `IG_ACCESS_TOKEN` | (60일 IG 페이지 토큰) |
| `IG_USER_ID` | `17841480444803324` |
| `SUPABASE_URL` | `https://loxatsblctecwmfcugzb.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | (Supabase secret key, `sb_secret_...`) |
| `SLACK_WEBHOOK_URL` | (옵션, Slack 알림용) |

`.env.local`에 있는 값 그대로 복사.

---

## 자동 게시 스케줄

| 시간 | KST | UTC | Cron |
|------|-----|-----|------|
| 점심 | 11:30 | 02:30 | `30 2 * * *` |
| 저녁 | 18:00 | 09:00 | `0 9 * * *` |

GitHub Actions가 자동 트리거 → Ubuntu runner에서 Puppeteer 실행 → 인스타 게시.

비용: GitHub Actions 월 2,000분 무료. 매 실행 ~2-3분, 일 2회 = 월 ~150분. 한도 안.

---

## 수동 실행

https://github.com/batonpass90-jpg/crescent/actions/workflows/daily-publish.yml

→ **"Run workflow"** 버튼 → **slot** 선택 (lunch/evening) → **Run**

테스트나 긴급 게시에 사용.

---

## 로컬 테스트

```powershell
cd meal-insta-bot
$env:SLOT="lunch"  # 또는 evening
$env:PUBLIC_BASE_URL="https://meal-insta-bot.vercel.app"
npm run cron:lunch   # 또는 cron:evening
```

→ 33초 후 인스타 게시 + Slack 알림.

---

## 실패 시 디버깅

1. GitHub Actions 페이지에서 실행 로그 확인
   - https://github.com/batonpass90-jpg/crescent/actions
2. Slack 알림이 있으면 에러 메시지 확인
3. 토큰 만료 (60일) → 재발급 후 GitHub Secret 업데이트

---

## Vercel과의 분담

| 역할 | 호스팅 |
|------|--------|
| 블로그 (66+ 페이지) | Vercel |
| `/render` 단일 카드 (Puppeteer 캡처 대상) | Vercel |
| `/api/publish` (수동 호출용) | Vercel — 단, Puppeteer 동작 안 함 (libnss3) |
| `/api/cron/daily-publish` (백업 endpoint) | Vercel — 비활성 |
| **실제 cron 게시** | **GitHub Actions** |

Vercel cron은 vercel.json에서 제거됨. Puppeteer 실행은 GitHub만.
