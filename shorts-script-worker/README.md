# shorts-script-worker

`shorts-script` Next.js 앱을 위한 상시 워커 서버. yt-dlp 다운로드, faster-whisper STT, ffmpeg 프레임/장면 분석 등 무거운 처리를 전담한다. Vercel 서버리스는 실행시간·바이너리 제약이 커서 이 처리를 감당할 수 없어 별도 서버로 분리했다.

## 로컬 개발

```bash
python -m venv .venv && .venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env  # 값 채우기
uvicorn app.main:app --reload
```

ffmpeg, tesseract-ocr는 로컬에도 별도 설치 필요(Docker 배포 시에는 Dockerfile에 포함됨).

## 배포

Railway/Render에 Dockerfile 기반으로 배포. 절차는 [`../shorts-script/DEPLOY.md`](../shorts-script/DEPLOY.md) 참고.
