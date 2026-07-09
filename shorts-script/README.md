# 쇼츠 대본 생성기 (shorts-script)

Crescent Studio 팀 전용 웹 도구. 영상 + 상품명 입력만으로 상품 조사와 트렌드 후킹 공식을 반영한 쇼츠 대본을 자동 생성한다.

- 프론트+API 오케스트레이션: 이 앱 (Next.js, Vercel 배포)
- 무거운 처리(다운로드/STT/ffmpeg): [`../shorts-script-worker`](../shorts-script-worker) (별도 상시 서버)

## 로컬 개발

```bash
npm install
cp .env.example .env.local  # 값 채우기
npm run dev
```

## 배포

전체 배포 절차(Vercel/Supabase/워커 서버)는 [`DEPLOY.md`](./DEPLOY.md) 참고.
