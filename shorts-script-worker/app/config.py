from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    worker_api_secret: str = "change-me"
    # 브라우저에서 직접 업로드할 때만 쓰는 별도 토큰 — 클라이언트 번들에 노출되므로
    # worker_api_secret과 분리한다(악용 시 blast radius를 "job 생성 스팸"으로 제한).
    worker_upload_token: str = "change-me-upload"
    allowed_origin: str = "http://localhost:3000"

    # RAM 여유 없는 무료 티어에서 OOM 나면 "base"로 낮출 것 (DEPLOY.md 참고)
    whisper_model: str = "small"
    whisper_device: str = "cpu"
    whisper_compute_type: str = "int8"

    data_dir: str = "./data"
    max_upload_mb: int = 500
    job_ttl_hours: int = 6

    # 롱폼 판별 임계값(초)
    longform_threshold_sec: int = 90

    # 무료 CPU 티어에서 STT/장면분석이 지나치게 오래 걸리는 것을 막기 위한 상한.
    # 이 길이를 넘으면 처리 시작 전에 timeout으로 즉시 안내한다 (진행 중 강제 중단은 하지 않음).
    max_video_duration_sec: int = 1200

    class Config:
        env_file = ".env"


settings = Settings()
Path(settings.data_dir).mkdir(parents=True, exist_ok=True)
