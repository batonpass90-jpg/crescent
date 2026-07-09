import logging
from pathlib import Path
from typing import Optional

from faster_whisper import WhisperModel

from app.config import settings
from app.job_store import job_store
from app.media import MediaProbeError, extract_audio
from app.models import JobStatus

logger = logging.getLogger("shorts_script_worker")

_model: Optional[WhisperModel] = None


def _get_model() -> WhisperModel:
    global _model
    if _model is None:
        logger.info(
            "faster-whisper 모델 로딩: %s (%s/%s)",
            settings.whisper_model,
            settings.whisper_device,
            settings.whisper_compute_type,
        )
        _model = WhisperModel(
            settings.whisper_model,
            device=settings.whisper_device,
            compute_type=settings.whisper_compute_type,
        )
    return _model


def run_transcription(job_id: str) -> None:
    job = job_store.get(job_id)
    if job is None or not job.video_path:
        return

    audio_path = str(Path(job.video_path).with_suffix(".wav"))
    try:
        extract_audio(job.video_path, audio_path)
    except MediaProbeError as e:
        job_store.set_status(job_id, JobStatus.ERROR, str(e))
        return

    try:
        model = _get_model()
        # vad_filter: 무음 구간을 건너뛰어 잘못된 발화 인식을 줄인다.
        segments_iter, info = model.transcribe(audio_path, beam_size=5, vad_filter=True)
        segments = [
            {"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip()}
            for s in segments_iter
        ]
    except Exception:
        logger.exception("STT 실패: job=%s", job_id)
        job_store.set_status(
            job_id,
            JobStatus.ERROR,
            "음성 인식(STT)에 실패했습니다. 오디오 형식 문제일 수 있습니다.",
        )
        return
    finally:
        Path(audio_path).unlink(missing_ok=True)

    if not segments:
        # 무음 영상이거나 발화가 거의 없는 경우 — 실패로 취급하지 않고 빈 대본으로 계속 진행한다.
        logger.info("job %s: 감지된 발화 없음 (무음/배경음악 위주 영상일 수 있음)", job_id)

    # 롱폼은 하이라이트 구간을 먼저 골라야 하므로 대기 상태로, 숏폼은 바로 장면 분석으로 진행.
    if job.is_longform:
        job_store.update(
            job_id,
            transcript_segments=segments,
            language=info.language,
            status=JobStatus.AWAITING_HIGHLIGHT_SELECTION,
        )
        return

    job_store.update(
        job_id,
        transcript_segments=segments,
        language=info.language,
        status=JobStatus.ANALYZING_SCENES,
    )

    from app.scenes import run_scene_analysis  # 순환 import 방지를 위한 지연 import

    run_scene_analysis(job_id, job.video_path)
