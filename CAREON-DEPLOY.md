# CareOn 배포 가이드

CareOn 운영 환경 세팅 절차입니다. 1번부터 순서대로 진행하세요.

---

## 1. Supabase 스키마 적용

### 1-1. 기본 스키마 (최초 1회)
Supabase Dashboard → SQL Editor에 `careon-schema.sql` 전체 붙여넣기 후 Run.

### 1-2. v2 추가 (서브도메인/푸시/보호자연결)
이어서 `careon-schema-v2.sql` 전체 붙여넣기 후 Run.

### 1-3. RLS 격리 검증
```sql
-- 다른 센터 UUID로 insert 시도 → 반드시 에러나야 함
insert into patients (center_id, name) values ('00000000-0000-0000-0000-000000000000', '침입자');
-- ERROR: new row violates row-level security policy
```

### 1-4. 슬러그 시드
각 센터에 슬러그를 부여:
```sql
update centers set slug = 'sunshine'  where name = '햇살요양센터';
update centers set slug = 'seoulcare' where name = '서울케어';
-- 형식: 소문자 + 숫자 + 하이픈, 3~32자
```

---

## 2. Web Push (VAPID) 키 발급

### 2-1. 로컬에서 키 생성
```bash
npx web-push generate-vapid-keys
```
출력 예:
```
Public Key:  BAHyEBgVrFjksjdfksjf...
Private Key: lkjasdflkjasdf...
```

### 2-2. 공개키 → push-client.js 반영
`push-client.js` 6번째 줄:
```js
const VAPID_PUBLIC_KEY = 'BAHyEBgVrFjksjdfksjf...'; // ← 여기에 Public Key
```

### 2-3. 비밀키 → Supabase Secrets 등록
Supabase Dashboard → Project Settings → Edge Functions → Manage secrets:
| 키 | 값 |
|---|---|
| `VAPID_PUBLIC_KEY` | (위 Public Key) |
| `VAPID_PRIVATE_KEY` | (위 Private Key) |
| `VAPID_SUBJECT` | `mailto:batonpass90@gmail.com` |

---

## 3. Solapi (알림톡 + SMS) 연동

### 3-1. Solapi 콘솔 → API 키 발급
https://console.solapi.com → 개발자센터 → API Key 발급

### 3-2. Supabase Secrets에 추가
| 키 | 값 |
|---|---|
| `SOLAPI_API_KEY` | (Solapi에서 발급) |
| `SOLAPI_API_SECRET` | (Solapi에서 발급) |
| `SOLAPI_FROM_NUMBER` | `01090329090` (등록된 발신번호) |
| `SOLAPI_KAKAO_PFID` | (옵션 - 카카오 비즈채널 PFID) |
| `SOLAPI_KAKAO_TPLID` | (옵션 - 알림톡 템플릿 ID) |

> 알림톡 템플릿 미등록 시: 자동으로 SMS만 사용. 운영 시작 후 카카오 비즈채널 + 템플릿 등록을 권장.

---

## 4. Edge Function 배포

### 4-1. Supabase CLI 설치
```bash
npm install -g supabase
supabase login
```

### 4-2. 프로젝트 연결
```bash
cd crescent-studio-deploy
supabase link --project-ref swsemxzgzcwwrhowuaqz
```

### 4-3. 함수 배포
```bash
supabase functions deploy send-notification
```

### 4-4. 동작 확인
```bash
curl -X POST 'https://swsemxzgzcwwrhowuaqz.supabase.co/functions/v1/send-notification' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "type":"test",
    "title":"테스트",
    "body":"안녕하세요",
    "recipient_phone":"01012345678"
  }'
```
응답에 `"delivered":"sms"` 가 나오면 성공.

---

## 5. 서브도메인 라우팅 (선택 - 본격 운영 시)

### Plan A: 파라미터 방식 (지금 즉시 가능)
각 센터에 다음 URL 안내:
- 마케팅: `https://crescentstudio.co.kr/care-site.html?c=sunshine`
- 로그인: `https://crescentstudio.co.kr/care-login.html?c=sunshine`

→ 파라미터가 localStorage에 저장되어 이후 페이지 이동 시 자동 유지.

### Plan B: 와일드카드 서브도메인 (Cloudflare Workers)
`sunshine.careon.co.kr` 같은 진짜 서브도메인을 쓰고 싶으면:

1. **도메인 → Cloudflare 이전** 또는 네임서버 변경
2. **Workers 생성**: Workers & Pages → Create → Worker → 이름 `careon-router`
3. **소스 코드 붙여넣기**: `cloudflare-worker.js` 전체 복사
4. **`ORIGIN` 상수 수정** (사용자 도메인에 맞게)
5. **Save and Deploy**
6. **Routes 등록**: `*.careon.co.kr/*` → `careon-router`
7. **DNS 와일드카드**: `*` → A 레코드 (proxy 활성화)

---

## 6. PWA 아이콘 (iOS Safari 대응)

`careon-icon.svg`만 있는 상태 → iOS Safari는 SVG 미지원.

### 권장: PNG 아이콘 추가
[https://realfavicongenerator.net](https://realfavicongenerator.net) 에 SVG 업로드 → 자동 생성된 PNG 다운로드:
- `apple-touch-icon-180.png`
- `icon-192.png`
- `icon-512.png`

루트에 업로드 후 `manifest.json` 의 icons 배열에 추가.

---

## 7. 운영 전 점검 체크리스트

- [ ] 5개 센터 슬러그 등록 + URL 안내 완료
- [ ] 두 개 다른 브라우저로 센터 A/B 동시 로그인 → 데이터 격리 확인
- [ ] 보호사 앱에서 GPS 체크인 → 보호자 앱에 실시간 반영 확인
- [ ] 케어 완료 → 보호자에게 푸시(또는 SMS) 도착 확인
- [ ] iPhone Safari + Android Chrome 모두 "홈 화면 추가" 동작
- [ ] 슈퍼어드민 페이지에서 5개 센터 모두 보이는지 확인
- [ ] Solapi 잔액 충전 확인 (SMS 1건 = 약 13원)
