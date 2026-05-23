# CareOn DB 사업 배포 가이드

자는 동안 작업 완료된 내용 + 사용자가 깬 직후 해야 할 작업 순서.

## ✅ 완료된 작업 (커밋·푸시 완료)

### 새 모델 = DB 사업
- 무료 홈페이지 + AI 진단 → 보호자 DB 판매 (건당 5,000원 선불)
- 5곳 한정 모집 (월 20건 무료 보너스)
- 영업자 파트너 모집 페이지(careon-recruit / careon-partner-recruit) `noindex` 처리

### 신규 파일
| 파일 | 역할 |
|---|---|
| `care-diagnosis.html` | 보호자용 11문항 무료 진단 (인스타스토리 UX) |
| `careon-lead-admin.html` | 센터장 게시판 (받은 DB 목록·관리, 60대 친화 큰 글자) |
| `careon-db-superadmin.html` | 운영자 — 센터 등록·충전·환불 + 매출 통계 |
| `careon-founding.html` | 5곳 한정 모집 영업 페이지 (전면 재작성) |
| `careon-schema-v10.sql` | DB 스키마 (centers 확장 + leads + credit_transactions + RPC) |
| `supabase/functions/submit-lead/index.ts` | Lead 제출 Edge Function (잔액 차감 + 센터장 SMS) |

### 수정된 파일
- `care-site.html` — 히어로/sticky CTA를 "🩺 부모님 등급 무료 진단"으로 변경
- `careon-founding.html` — DB 사업 모델로 전면 재작성
- `careon-recruit.html`, `careon-partner-recruit.html` — `<meta name="robots" content="noindex,nofollow">` 추가
- 메모리 파일 2종 (careon_pricing.md, project_commission.md) — 새 모델 반영

---

## 🚀 사용자가 깬 직후 해야 할 작업 (순서대로)

### 1. Supabase 스키마 적용 (5분)
```
Supabase Dashboard → SQL Editor → New Query
→ careon-schema-v10.sql 전체 복사·붙여넣기
→ Run
```
콘솔에 `✅ CareOn v10 스키마 적용 완료` 메시지 떠야 성공.

### 2. Edge Function 배포 (10분)
로컬에서:
```bash
supabase login
supabase link --project-ref swsemxzgzcwwrhowuaqz
supabase functions deploy submit-lead --no-verify-jwt
```

### 3. Supabase 시크릿 확인
Dashboard → Edge Functions → Secrets에 이미 있을 것:
- `SOLAPI_API_KEY`
- `SOLAPI_API_SECRET`
- `SOLAPI_FROM_NUMBER` (010-9032-9090)

추가 권장:
- `CAREON_ADMIN_URL` = `https://crescentstudio.co.kr/careon-lead-admin.html`

### 4. 첫 센터 등록 (테스트용)
브라우저에서:
```
https://crescentstudio.co.kr/care-superadmin.html → 로그인
→ "DB 사업 운영" 페이지로 이동 (또는 직접: /careon-db-superadmin.html)
→ [+ 신규 센터 등록] 클릭
→ 정보 입력 (슬러그는 영문 소문자·하이픈)
→ 공개 상태: "공개"
→ 저장
```

### 5. 진단 페이지 테스트
```
https://crescentstudio.co.kr/care-diagnosis.html?c={등록한_슬러그}
```

진단 끝까지 진행 후 [상담 신청] → 알림 휴대폰으로 SMS 도착해야 성공.

### 6. 센터장 로그인 테스트
센터장 계정으로 로그인:
```
https://crescentstudio.co.kr/careon-lead-admin.html
```
방금 들어온 DB가 목록에 보여야 함.

---

## 🔧 Vercel 이전 (선택 사항, 별도 작업)

현재는 GitHub Pages + query param 라우팅(`?c=slug`).
Vercel로 이전하면 path 라우팅 가능(`/care/{slug}`).

작업:
1. https://vercel.com → New Project → GitHub repo 연결
2. Build settings: 그대로 두고 (정적 사이트)
3. Domains → `crescentstudio.co.kr` 추가
4. DNS A 레코드를 Vercel IP로 변경 (가비아 등)
5. `vercel.json` rewrites 추가:
   ```json
   {
     "rewrites": [
       { "source": "/care/:slug", "destination": "/care-site.html?c=:slug" },
       { "source": "/care/:slug/diagnosis", "destination": "/care-diagnosis.html?c=:slug" }
     ]
   }
   ```
6. care-site.html, care-diagnosis.html의 slug fetch 로직은 그대로 (window.location.search 사용)

---

## 📊 운영 워크플로

### 신규 센터 모집 (콜드콜)
1. 홈페이지 없는 방문요양센터에 전화
2. `careon-founding.html` 링크 카톡 발송
3. 센터장이 폼 제출 → 이메일 알림
4. 24시간 내 통화·정보 확인
5. 슈퍼어드민에서 센터 등록 (`careon-db-superadmin.html`)
6. 센터장 계정 생성 (Supabase Auth → 이메일 invite)
7. 슬러그·QR 코드 카톡으로 전달

### 보호자 DB 흐름
1. 보호자가 센터 URL 또는 진단 링크 방문
2. 11문항 진단 (3분)
3. 결과 화면에서 [상담 신청] 누름
4. submit-lead RPC: 잔액 검증 → 5,000원 차감 → leads insert
5. 센터장 휴대폰에 SMS 도착
6. 센터장이 직접 통화

### 잔액 부족 시
- 자동: 상담 신청 화면이 "마감되었습니다"로 표시
- 센터장이 운영자에게 카톡 → 입금 → 슈퍼어드민에서 [충전] 클릭

---

## ⚠️ 알려진 미완성

1. **카카오 알림톡 미지원** — 현재는 SMS만. 비즈채널 가입 부담 때문에 보류.
2. **결제 자동화 미연동** — 토스페이먼츠 등 미연결. 무통장 입금 후 슈퍼어드민에서 수동 충전.
3. **로고 업로드 UI 없음** — Supabase Storage에 수동 업로드 후 logo_url 입력.
4. **Vercel path routing 미적용** — 현재 `?c=slug` 사용 중.
5. **gh-pages → 새 진입점 인덱스** — index.html에 careon-founding 링크 미추가 (선택).

---

## 📁 파일 정리 (옵션)

영업자 모집 페이지는 noindex만 적용. 완전 삭제하지 않음 (혹시 모르니).
- `careon-recruit.html`
- `careon-partner-recruit.html`
- `careon-client.html` (요양원 원장 영업 — 보류 상태)

향후 정리 시 `_deprecated/` 폴더로 이동 권장.
