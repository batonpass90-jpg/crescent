import json
import subprocess


class MediaProbeError(Exception):
    pass


def probe_duration_sec(path: str) -> float:
    try:
        result = subprocess.run(
            [
                "ffprobe",
                "-v", "error",
                "-show_entries", "format=duration",
                "-of", "json",
                path,
            ],
            capture_output=True,
            text=True,
            timeout=30,
            check=True,
        )
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired, FileNotFoundError) as e:
        raise MediaProbeError(f"영상 길이 확인에 실패했습니다: {e}") from e

    try:
        data = json.loads(result.stdout)
        return float(data["format"]["duration"])
    except (KeyError, ValueError, json.JSONDecodeError) as e:
        raise MediaProbeError(f"영상 길이 파싱에 실패했습니다: {e}") from e


def has_subtitle_track(path: str) -> bool:
    try:
        result = subprocess.run(
            [
                "ffprobe",
                "-v", "error",
                "-select_streams", "s",
                "-show_entries", "stream=index",
                "-of", "json",
                path,
            ],
            capture_output=True,
            text=True,
            timeout=30,
        )
        data = json.loads(result.stdout or "{}")
        return len(data.get("streams", [])) > 0
    except Exception:
        return False


def trim_video(video_path: str, out_path: str, start_sec: float, end_sec: float) -> None:
    duration = max(0.1, end_sec - start_sec)
    try:
        subprocess.run(
            [
                "ffmpeg", "-y",
                "-ss", str(start_sec),
                "-i", video_path,
                "-t", str(duration),
                # 짧은 하이라이트 클립이라 재인코딩 비용이 작음 — 대신 정확한 프레임 위치에서 컷.
                "-c:v", "libx264",
                "-c:a", "aac",
                "-avoid_negative_ts", "make_zero",
                out_path,
            ],
            capture_output=True,
            text=True,
            timeout=300,
            check=True,
        )
    except subprocess.CalledProcessError as e:
        raise MediaProbeError(f"영상 컷 편집에 실패했습니다: {e.stderr[:500]}") from e
    except subprocess.TimeoutExpired as e:
        raise MediaProbeError("영상 컷 편집 시간이 초과되었습니다.") from e


def extract_audio(video_path: str, audio_path: str) -> None:
    try:
        subprocess.run(
            [
                "ffmpeg", "-y",
                "-i", video_path,
                "-vn",
                "-ac", "1",
                "-ar", "16000",
                "-acodec", "pcm_s16le",
                audio_path,
            ],
            capture_output=True,
            text=True,
            timeout=600,
            check=True,
        )
    except subprocess.CalledProcessError as e:
        raise MediaProbeError(f"오디오 추출에 실패했습니다: {e.stderr[:500]}") from e
    except subprocess.TimeoutExpired as e:
        raise MediaProbeError("오디오 추출 시간이 초과되었습니다.") from e
