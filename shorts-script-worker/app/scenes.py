import logging
import re
import subprocess
from pathlib import Path
from typing import Any, Optional

import cv2

from app.job_store import job_store
from app.models import JobStatus

logger = logging.getLogger("shorts_script_worker")

FRAME_INTERVAL_SEC = 2.5
# 연산량 제한을 위해 프레임 2개당 1개만 OCR 수행 (완벽한 정확도보다 무료 CPU 티어에서의 처리 속도 우선)
OCR_STRIDE = 2
MAX_FRAMES = 60

_face_cascade: Optional[cv2.CascadeClassifier] = None


class SceneAnalysisError(Exception):
    pass


def _get_face_cascade() -> cv2.CascadeClassifier:
    global _face_cascade
    if _face_cascade is None:
        path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        _face_cascade = cv2.CascadeClassifier(path)
    return _face_cascade


def _extract_frames(video_path: str, out_dir: str, interval_sec: float = FRAME_INTERVAL_SEC) -> list[dict]:
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    pattern = str(out / "frame_%04d.jpg")

    try:
        subprocess.run(
            [
                "ffmpeg", "-y",
                "-i", video_path,
                "-vf", f"fps=1/{interval_sec}",
                "-qscale:v", "4",
                "-frames:v", str(MAX_FRAMES),
                pattern,
            ],
            capture_output=True,
            text=True,
            timeout=300,
            check=True,
        )
    except subprocess.CalledProcessError as e:
        raise SceneAnalysisError(f"프레임 추출 실패: {e.stderr[:300]}") from e
    except subprocess.TimeoutExpired as e:
        raise SceneAnalysisError("프레임 추출 시간 초과") from e

    frames = sorted(out.glob("frame_*.jpg"))
    return [
        {"index": i, "timestamp_sec": round(i * interval_sec, 2), "path": str(p)}
        for i, p in enumerate(frames)
    ]


def _detect_scene_cuts(video_path: str, threshold: float = 0.4) -> list[float]:
    """ffmpeg의 scene-change 스코어 필터로 컷 지점을 찾는다. 완전 무료, 별도 모델 불필요."""
    try:
        result = subprocess.run(
            [
                "ffmpeg", "-i", video_path,
                "-vf", f"select='gt(scene,{threshold})',showinfo",
                "-f", "null", "-",
            ],
            capture_output=True,
            text=True,
            timeout=300,
        )
    except subprocess.TimeoutExpired:
        return []

    return [float(m.group(1)) for m in re.finditer(r"pts_time:(\d+\.?\d*)", result.stderr)]


def _has_face(frame_path: str) -> bool:
    img = cv2.imread(frame_path)
    if img is None:
        return False
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = _get_face_cascade().detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(40, 40))
    return len(faces) > 0


def _has_text_overlay(frame_path: str) -> Optional[bool]:
    """텍스트 오버레이 감지는 best-effort — Tesseract 미설치/실패 시 None(판단 불가)을 반환한다."""
    try:
        import pytesseract
        from PIL import Image
    except ImportError:
        return None
    try:
        text = pytesseract.image_to_string(Image.open(frame_path), timeout=5)
        return len(text.strip()) >= 2
    except Exception:
        return None


def analyze_scenes(video_path: str, frames_dir: str) -> list[dict[str, Any]]:
    frames = _extract_frames(video_path, frames_dir)
    cut_times = _detect_scene_cuts(video_path)

    scenes = []
    for i, f in enumerate(frames):
        ts = f["timestamp_sec"]
        is_cut = any(abs(ts - ct) <= FRAME_INTERVAL_SEC for ct in cut_times)
        has_person = _has_face(f["path"])
        has_text = _has_text_overlay(f["path"]) if i % OCR_STRIDE == 0 else None

        scenes.append(
            {
                "timestamp_sec": ts,
                "is_cut_point": is_cut,
                "has_person": has_person,
                "has_text_overlay": has_text,
            }
        )

    # 프레임 이미지 자체는 보관하지 않는다 — job 결과에는 메타데이터만 남긴다 (스토리지 비용 회피).
    for f in frames:
        Path(f["path"]).unlink(missing_ok=True)

    return scenes


def run_scene_analysis(job_id: str, video_path: str) -> None:
    """장면 분석은 어디까지나 하이라이트 후보 판단을 돕는 보조 신호이므로,
    실패해도 전체 작업을 실패시키지 않고 scenes=None으로 계속 진행한다."""
    frames_dir = str(Path(video_path).parent / "frames")
    try:
        scenes = analyze_scenes(video_path, frames_dir)
    except Exception:
        logger.exception("장면 분석 실패(계속 진행): job=%s", job_id)
        scenes = None

    job_store.update(job_id, scenes=scenes, status=JobStatus.READY)
