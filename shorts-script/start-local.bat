@echo off
setlocal

set FFMPEG_BIN=C:\Users\chosh\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin
set TESSERACT_BIN=C:\Program Files\Tesseract-OCR
set PATH=%FFMPEG_BIN%;%TESSERACT_BIN%;%PATH%

echo ============================================
echo  쇼츠 대본 생성기 - 로컬 실행
echo ============================================
echo.
echo 워커 서버 켜는 중...
start "shorts-script-worker (이 창은 닫지 마세요)" cmd /k "cd /d D:\APP\crescent-studio-deploy\shorts-script-worker && .venv\Scripts\python.exe -m uvicorn app.main:app --port 8000"

timeout /t 4 /nobreak >nul

echo 웹사이트 켜는 중...
start "shorts-script (이 창은 닫지 마세요)" cmd /k "cd /d D:\APP\crescent-studio-deploy\shorts-script && npm run dev"

timeout /t 6 /nobreak >nul

echo 브라우저 여는 중...
start http://localhost:3000

echo.
echo ============================================
echo  다 켜졌습니다! 브라우저에서 로그인 하세요.
echo  팀 비밀번호는 .env.local 파일의 TEAM_PASSWORD 값입니다.
echo.
echo  다 쓰셨으면 방금 열린 검은 창 2개를 닫으면 꺼집니다.
echo ============================================
pause
