# 네이버 노출 셋업 가이드

소요 블로그(meal-insta-bot.vercel.app)를 네이버 검색에 노출시키는 방법.

⚠️ **네이버 블로그 직접 자동 게시는 불가** (API 폐쇄, Selenium은 정책 위반).
대신 자체 블로그가 **네이버 검색 결과에 자동 노출**되도록 셋업.

---

## 1. 네이버 서치어드바이저 등록 (필수, 10분)

### Step 1. 사이트 등록

1. https://searchadvisor.naver.com/ 접속 → 네이버 로그인
2. 우상단 **"웹마스터 도구"** 클릭
3. 좌측 **"사이트 관리"** → **"사이트 등록"**
4. URL 입력: `https://meal-insta-bot.vercel.app`
5. **다음** 클릭

### Step 2. 소유 확인 — 메타태그 방식

화면에 다음과 같은 메타태그가 표시됨:
```html
<meta name="naver-site-verification" content="abc123def456...">
```

`content="..."` 안의 코드만 복사 → **Vercel 대시보드 환경변수에 등록**:

```bash
# 또는 Vercel CLI
vercel env add NAVER_SITE_VERIFICATION production
# (값 붙여넣기, 따옴표 X)
```

또는 대시보드에서:
- https://vercel.com/batonpass90-2139s-projects/meal-insta-bot/settings/environment-variables
- **"Add New"** → Name: `NAVER_SITE_VERIFICATION`, Value: `abc123...`

→ 자동 재배포 (5분)

### Step 3. 소유권 확인

서치어드바이저로 돌아와 **"확인"** 버튼 클릭. 메타태그가 사이트에 박혔는지 검증.

### Step 4. 사이트맵 제출

- 좌측 **"요청"** → **"사이트맵 제출"**
- URL: `https://meal-insta-bot.vercel.app/sitemap.xml`
- 제출

→ 네이버봇이 자동 크롤링 시작 (보통 1~7일 안에 첫 색인).

### Step 5. RSS 제출 (보너스)

- 좌측 **"요청"** → **"RSS 제출"**
- URL: `https://meal-insta-bot.vercel.app/rss.xml`
- 제출

---

## 2. 구글 Search Console (5분, SEO 필수)

1. https://search.google.com/search-console 접속 → 구글 로그인
2. **속성 추가** → **URL 접두어** → `https://meal-insta-bot.vercel.app`
3. 소유권 확인 — **HTML 태그** 방식 선택
4. 메타태그의 `content="..."` 코드 복사
5. Vercel 환경변수 등록:
   ```
   GOOGLE_SITE_VERIFICATION=abc123...
   ```
6. 재배포 후 **확인** 클릭
7. **사이트맵** 메뉴 → URL 입력 `sitemap.xml` → 제출

---

## 3. 다음 검색 등록 (3분)

1. https://register.search.daum.net/index.daum 접속
2. **사이트 등록 신청**
3. URL: `https://meal-insta-bot.vercel.app`
4. 정보 입력 후 신청 → 1~14일 검토 후 등록

다음은 카카오 검색에도 노출됨.

---

## 4. 네이버 인플루언서 (★ 가장 강력)

### 자격 조건
- 카테고리별 일정 활동량 (요리·푸드 카테고리)
- 본인 콘텐츠 (인스타·블로그 등)
- 최근 6개월 활동 + 콘텐츠 전문성

### 신청 → 승인 → RSS 등록

1. https://in.naver.com/ 접속
2. 우상단 **인플루언서 신청**
3. 카테고리: **푸드** (자취 식단 적합)
4. 인스타그램 연동: `@soyo.recipe` 추가
5. 자체 블로그 RSS 추가: `https://meal-insta-bot.vercel.app/rss.xml`
6. 신청 후 약 2주 심사

### 승인 후 효과
- 네이버 검색 시 **인플루언서 콘텐츠로 우선 노출**
- 자체 블로그 글이 자동으로 인플루언서 채널에 표시
- 네이버 모바일 앱 "인플루언서 검색" 노출

---

## 5. 색인 요청 자동화 (이미 구현)

### Cron 등록된 자동화
- 매일 11:30 KST 인스타 게시 → sitemap에 새 콘텐츠 즉시 반영
- 새 글 추가 시 git push → Vercel 빌드 → sitemap.xml 자동 업데이트
- 네이버봇이 자동 크롤링 (보통 24시간 내)

### 수동 색인 요청 (긴급 시)
- 네이버 서치어드바이저 → **요청** → **수집 요청** → URL 입력
- 예: 새 인기 레시피 추가 시 즉시 색인 요청

### Sitemap ping endpoint (보조)
```bash
curl "https://meal-insta-bot.vercel.app/api/cron/sitemap-ping" \
  -H "Authorization: Bearer $CRON_SECRET"
```
- Bing 등 일부 검색엔진에 sitemap 갱신 알림
- 구글은 ping deprecated (Search Console에서 자동 발견)
- 네이버는 등록만 하면 자동

---

## 6. 네이버 SEO 추가 팁

### 콘텐츠 작성 가이드
- **제목**: "{음식이름} 레시피 — 자취 5년차" (검색 키워드 + 시리즈)
- **본문**: 한국어 자연어, 키워드 자연스럽게 5~7회
- **이미지**: alt 태그에 음식 이름 (이미 적용됨)
- **내부 링크**: 관련 레시피끼리 연결
- **외부 링크**: 인스타·소요 앱 (이미 CTA에 포함)

### 네이버가 좋아하는 것
- 한국어 콘텐츠 (이미 OK)
- 모바일 친화 (이미 적용됨)
- 빠른 로딩 (Vercel CDN으로 자동)
- HTTPS (Vercel 자동)
- 구조화된 데이터 — JSON-LD Recipe schema (이미 적용됨)

---

## 7. 결과 측정

### 1주차
- 네이버 서치어드바이저 → **검색 노출** 메뉴 → 사이트가 색인됐는지 확인
- 구글 Search Console → **성과** 메뉴

### 1개월차
- 네이버에서 "자취 김치볶음밥" 등 키워드로 직접 검색 → 우리 사이트 노출 확인
- 검색 결과 5위 안에 들면 트래픽 안정화

### 3개월차
- 네이버 인플루언서 승인 (가능한 경우)
- 트래픽 안정 + 인스타·블로그 동반 성장

---

## 트러블슈팅

| 증상 | 원인 |
|------|------|
| 메타태그 인증 실패 | 환경변수 등록 후 재배포 안 됨 — `vercel --prod` 다시 실행 |
| 사이트맵 0건 | 빌드 후 sitemap.xml 직접 접속해서 확인 (https://meal-insta-bot.vercel.app/sitemap.xml) |
| 색인 안 됨 (1개월 후) | 콘텐츠 부족 또는 도메인 신뢰도 낮음 — 콘텐츠 추가 + 자연 트래픽 늘리기 |
| 네이버 검색에 안 나옴 | 네이버는 자체 블로그 우대 — 시간 걸림. 인플루언서 가입이 가속화 |

---

## 한계 인정

- **자체 블로그 = 네이버 블로그가 아님** → 네이버 블로그 검색에는 안 나옴 (View 탭, 사이트 탭 노출만)
- 네이버는 자기 플랫폼 콘텐츠를 우대 (네이버 블로그 > 외부 사이트)
- 그래서 인플루언서 자격 따는 게 가장 강력한 우회로

---

본인이 직접 위 단계들을 완료하시면 자동화 인프라(이미 구축됨)와 결합되어
**한국 검색 트래픽이 자체 블로그 → 인스타 → 소요 앱**으로 흐릅니다.
