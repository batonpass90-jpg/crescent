FROM python:3.11-slim

# ffmpeg: 오디오/영상 처리, tesseract-ocr: 자막/텍스트 오버레이 감지(best-effort)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    tesseract-ocr \
    tesseract-ocr-kor \
    tesseract-ocr-eng \
    tesseract-ocr-chi-sim \
    tesseract-ocr-jpn \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
