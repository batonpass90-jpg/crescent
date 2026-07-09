# 배포 가이드 — 쇼츠 대본 생성기 (shorts-script)

이 문서는 처음부터 끝까지 순서대로 따라가면 배포가 끝나도록 구성했다. 두 서비스를 각각 배포한다.

- **shorts-script** (이 폴더) — Next.js, 프론트 + Claude API 오케스트레이션 → **Vercel**
- **shorts-script-worker** (`../shorts-script-worker`) — FastAPI, 다운로드/STT/ffmpeg 처리 → **Railway 또는 Render**

배포 순서가 중요하다: **워커를 먼저 배포**해서 URL을 받아야 Vercel 환경변수를 채울 수 있다.

---

## 1. Supabase 프로젝트 생성 (신규 전용)

CareOn/beauty 등 다른 사업용 프로젝트와 절대 공유하지 않는다 — 이 도구 전용으로 새로 만든다.

1. [supabase.com](https://supabase.com) → New project
2. 프로젝트 생성 후 **SQL Editor**에서 [`supabase/schema.sql`](./supabase/schema.sql) 전체 내용을 실행
3. Project Settings → API 에서 아래 값을 복사해둔다

| 값 | 어디서 |
|---|---|
| `SUPABASE_URL` | Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role secret (⚠️ anon key 아님, 절대 클라이언트에 노출 금지) |

---

## 2. Anthropic API 키 발급

1. [console.anthropic.com](https://console.anthropic.com) → API Keys → 새 키 생성
2. `ANTHROPIC_API_KEY` 값으로 보관

Claude API 비용은 이 프로젝트의 필수 승인 비용이다. 모델은 코드(`lib/claude.ts`)에서 고정 관리한다 — Haiku(번역/요약/조사정리/점수화), Sonnet(대본 생성).

---

## 3. 워커 서버 배포 (Railway 예시)

### 3-1. 비용/사양 관련 필수 확인 사항

`faster-whisper`의 `small` 모델은 RAM이 약 1.5~2GB 필요하다. 완전 무료 티어(예: Render Free 512MB RAM)에서는 OOM으로 죽을 수 있다.

**OOM 발생 시 대응 순서 (반드시 먼저 시도, 유료 전환은 그다음):**
1. 워커 환경변수 `WHISPER_MODEL`을 `small` → `base`로 변경 후 재배포 (정확도는 떨어지지만 RAM 요구량이 크게 줄어듦)
2. 그래도 불안정하면 그때 유료 사양(Railway Hobby 등)으로 전환 여부를 팀에 먼저 알리고 결정한다. 절대 임의로 유료 플랜을 확정하지 않는다.

### 3-2. Railway 배포

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub repo → 이 레포 선택
2. **Root Directory**를 `shorts-script-worker`로 지정 (모노레포이므로 반드시 지정)
3. Railway가 `Dockerfile`을 자동 인식해서 빌드한다 (별도 buildpack 설정 불필요)
4. Variables 탭에서 아래 환경변수 설정

| 변수 | 값 | 비고 |
|---|---|---|
| `WORKER_API_SECRET` | `openssl rand -hex 32` 등으로 생성한 임의 문자열 | 서버 전용, 절대 노출 금지 |
| `WORKER_UPLOAD_TOKEN` | 위와 별도로 생성한 또 다른 임의 문자열 | 브라우저에 노출되는 값 — `WORKER_API_SECRET`과 반드시 다르게 |
| `ALLOWED_ORIGIN` | `https://<vercel-앱-도메인>` | 4단계에서 Vercel 배포 후 확정, 배포 전엔 임시로 `http://localhost:3000` |
| `WHISPER_MODEL` | `small` | OOM 나면 `base`로 |
| `WHISPER_DEVICE` | `cpu` | GPU 서버 확보 전까지 고정 |
| `WHISPER_COMPUTE_TYPE` | `int8` | CPU에서 속도/메모리 균형 |
| `DATA_DIR` | `./data` | 컨테이너 내부 임시 저장 경로 |
| `MAX_UPLOAD_MB` | `500` | 업로드 용량 제한, 필요시 조정 |
| `JOB_TTL_HOURS` | `6` | 오래된 작업 폴더 정리 기준 |
| `LONGFORM_THRESHOLD_SEC` | `90` | 롱폼 판별 임계값 |
| `MAX_VIDEO_DURATION_SEC` | `1200` | 처리 상한(20분) — 넘으면 timeout으로 즉시 안내 |

5. 배포 완료 후 발급된 URL(`https://xxx.up.railway.app`)을 확인 — 이게 `WORKER_BASE_URL`이다
6. 확인:
   ```bash
   curl https://xxx.up.railway.app/health
   # {"ok":true} 가 나오면 정상
   ```

### 3-3. Render로 배포하는 경우 (대안)

- New → Web Service → 레포 연결 → Root Directory `shorts-script-worker` → Environment: Docker
- 환경변수는 위 표와 동일하게 설정
- Render 무료 티어는 15분 미사용 시 슬립 → 첫 요청이 느릴 수 있다는 점을 팀에 안내

---

## 4. shorts-script를 Vercel에 배포

1. Vercel → Add New Project → 이 레포 선택 → **Root Directory를 `shorts-script`로 지정**
2. Framework Preset: Next.js (자동 인식)
3. Environment Variables 설정

| 변수 | 값 | 노출 범위 |
|---|---|---|
| `TEAM_PASSWORD` | 팀에 공유할 임의 비밀번호 | 서버 전용 |
| `ANTHROPIC_API_KEY` | 2단계에서 발급한 키 | 서버 전용 |
| `SUPABASE_URL` | 1단계 값 | 서버 전용 |
| `SUPABASE_SERVICE_ROLE_KEY` | 1단계 값 | 서버 전용 |
| `WORKER_BASE_URL` | 3단계에서 확인한 워커 URL | 서버 전용 |
| `WORKER_API_SECRET` | 워커의 `WORKER_API_SECRET`과 **동일한 값** | 서버 전용 |
| `NEXT_PUBLIC_WORKER_BASE_URL` | 워커 URL (위와 동일 값) | **클라이언트 노출** |
| `NEXT_PUBLIC_WORKER_UPLOAD_TOKEN` | 워커의 `WORKER_UPLOAD_TOKEN`과 **동일한 값** | **클라이언트 노출** |

4. 배포
5. 배포된 도메인이 확정되면 **3단계로 돌아가 워커의 `ALLOWED_ORIGIN`을 이 도메인으로 업데이트하고 재배포** (CORS 필수)

---

## 5. 팀 접근

- 팀원들에게 배포된 Vercel URL + `TEAM_PASSWORD` 값을 공유
- 로그인은 팀 공용 비밀번호 한 개, 개별 계정 없음 (쿠키 세션 30일 유지)

---

## 6. 메인 사이트에 링크 연결

레포 루트 `index.html`의 상단 네비게이션(`<nav class="top-nav">`)에 "쇼츠 대본" 링크가 이미 추가되어 있다. 배포 완료 후 그 `href` 값을 4단계에서 확정된 실제 Vercel URL로 교체한다:

```html
<a href="https://shorts-script.vercel.app" target="_blank" rel="noopener">쇼츠 대본</a>
```

팀 비밀번호로 보호되므로 공개 네비게이션에 있어도 외부 방문자는 로그인 화면만 보게 된다.

---

## 7. 배포 후 점검 체크리스트

- [ ] `curl <워커URL>/health` → `{"ok":true}`
- [ ] Vercel 배포 URL 접속 → `/login` 리다이렉트 확인
- [ ] 팀 비밀번호로 로그인 성공
- [ ] 짧은(90초 미만) 유튜브 링크로 전체 파이프라인 1회 실행 — 대본까지 끝까지 나오는지 확인
- [ ] 90초 이상 영상으로 하이라이트 후보 선택 화면이 뜨는지 확인
- [ ] Supabase `jobs` / `product_research` / `scripts` 테이블에 데이터가 쌓이는지 확인
- [ ] `/history`에서 방금 만든 대본이 보이는지 확인
- [ ] 워커 `ALLOWED_ORIGIN`이 실제 Vercel 도메인과 일치하는지 (CORS 에러 없는지 브라우저 콘솔로 확인)

---

## 8. 알려진 제약 (팀에 미리 공유할 것)

- **whisper `small` 모델**: `medium`보다 정확도가 낮다. GPU 서버를 확보하기 전까지는 속도-정확도 트레이드오프를 감수한 선택이다. 실사용 결과를 보고 필요하면 재조정한다.
- **텍스트 오버레이 감지(OCR)**: 무료 Tesseract 기반 best-effort다. 프레임 절반만 샘플링하며, 완벽한 정확도를 보장하지 않는다.
- **장면 전환 감지**: ffmpeg의 scene-score 필터를 쓰는 무료 방식이다. 상용 장면분석 대비 정교하지 않을 수 있다.
- **샤오홍슈**: 로그인 필요 콘텐츠가 많아 다운로드가 자주 실패한다. 실패 시 파일 직접 업로드로 안내된다.
- **완전 자동 발행 아님**: 모든 결과물은 사람이 최종 검수 후 발행하는 것을 전제로 설계했다.
- **영상 원본 미보관**: 워커 로컬 디스크에서만 처리 후 폐기하며, Supabase에는 대본/조사결과/장면 메타데이터만 저장한다 (스토리지 비용 관리를 위한 의도적 설계).
