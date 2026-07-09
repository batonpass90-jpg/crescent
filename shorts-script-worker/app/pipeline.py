import logging
from pathlib import Path

from app.config import settings
from app.downloader import DownloadError, download_from_url
from app.job_store import job_store
from app.media import MediaProbeError, has_subtitle_track, probe_duration_sec, trim_video
from app.models import JobStatus

logger = logging.getLogger("shorts_script_worker")


def _finalize_ingest(job_id: str, video_path: str) -> None:
    try:
        duration = probe_duration_sec(video_path)
    except MediaProbeError as e:
        job_store.set_status(job_id, JobStatus.ERROR, str(e))
        return

    if duration > settings.max_video_duration_sec:
        minutes = settings.max_video_duration_sec // 60
        job_store.set_status(
            job_id,
            JobStatus.TIMEOUT,
            f"영상이 너무 깁니다 (최대 {minutes}분). 더 짧은 구간으로 다시 시도해 주세요.",
        )
        return

    subtitle = has_subtitle_track(video_path)
    is_longform = duration > settings.longform_threshold_sec

    job_store.update(
        job_id,
        video_path=video_path,
        duration_sec=duration,
        has_subtitle_track=subtitle,
        is_longform=is_longform,
        status=JobStatus.TRANSCRIBING,
    )

    from app.stt import run_transcription  # 순환 import 방지를 위한 지연 import

    run_transcription(job_id)


def run_ingest_pipeline(job_id: str) -> None:
    """업로드된 파일이 이미 디스크에 있는 경우 — 길이 확인부터 시작."""
    job = job_store.get(job_id)
    if job is None or not job.video_path:
        return
    _finalize_ingest(job_id, job.video_path)


def run_download_pipeline(job_id: str, source_url: str, job_dir: str) -> None:
    """링크 입력인 경우 — yt-dlp 다운로드부터 시작."""
    job_store.set_status(job_id, JobStatus.DOWNLOADING)
    try:
        video_path = download_from_url(source_url, job_dir, settings.max_upload_mb)
    except DownloadError as e:
        job_store.set_status(job_id, JobStatus.DOWNLOAD_FAILED, e.user_message)
        return
    except Exception:
        logger.exception("download failed unexpectedly for job %s", job_id)
        job_store.set_status(
            job_id,
            JobStatus.DOWNLOAD_FAILED,
            "알 수 없는 오류로 다운로드에 실패했습니다. 영상 파일을 직접 업로드해 주세요.",
        )
        return

    _finalize_ingest(job_id, video_path)


def run_trim_pipeline(job_id: str, start_sec: float, end_sec: float) -> None:
    """사용자가 롱폼에서 하이라이트 구간을 선택하면 그 구간만 잘라 이후 단계의 소스로 만든다."""
    job = job_store.get(job_id)
    if job is None or not job.video_path:
        return

    job_store.set_status(job_id, JobStatus.TRIMMING)

    job_dir = Path(job.video_path).parent
    trimmed_path = str(job_dir / "highlight.mp4")
    try:
        trim_video(job.video_path, trimmed_path, start_sec, end_sec)
    except MediaProbeError as e:
        job_store.set_status(job_id, JobStatus.ERROR, str(e))
        return

    job_store.update(
        job_id,
        trimmed_video_path=trimmed_path,
        selected_highlight={"start_sec": start_sec, "end_sec": end_sec},
        status=JobStatus.ANALYZING_SCENES,
    )

    from app.scenes import run_scene_analysis  # 순환 import 방지를 위한 지연 import

    run_scene_analysis(job_id, trimmed_path)
