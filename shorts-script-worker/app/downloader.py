from pathlib import Path
from typing import Optional

import yt_dlp


class DownloadError(Exception):
    def __init__(self, message: str, user_message: str):
        super().__init__(message)
        self.user_message = user_message


XIAOHONGSHU_HOSTS = ("xiaohongshu.com", "xhslink.com")


def _is_xiaohongshu(url: str) -> bool:
    return any(host in url for host in XIAOHONGSHU_HOSTS)


def download_from_url(url: str, dest_dir: str, max_upload_mb: int) -> str:
    dest = Path(dest_dir)
    dest.mkdir(parents=True, exist_ok=True)
    out_template = str(dest / "source.%(ext)s")

    ydl_opts = {
        "outtmpl": out_template,
        "format": "mp4/bestvideo+bestaudio/best",
        "merge_output_format": "mp4",
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "max_filesize": max_upload_mb * 1024 * 1024,
        "socket_timeout": 30,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
    except yt_dlp.utils.DownloadError as e:
        if _is_xiaohongshu(url):
            raise DownloadError(
                str(e),
                "샤오홍슈 링크는 로그인이 필요한 콘텐츠가 많아 다운로드에 실패했습니다. "
                "영상 파일을 직접 업로드해 주세요.",
            ) from e
        raise DownloadError(
            str(e),
            "영상 다운로드에 실패했습니다. 비공개이거나 삭제된 링크일 수 있습니다. "
            "영상 파일을 직접 업로드해 주세요.",
        ) from e

    path: Optional[Path] = Path(filename)
    if not path.exists():
        # merge_output_format으로 실제 확장자가 달라진 경우 보정
        candidates = sorted(dest.glob("source.*"))
        path = candidates[0] if candidates else None

    if path is None or not path.exists():
        raise DownloadError(
            "downloaded file not found after yt-dlp run",
            "다운로드에 실패했습니다. 영상 파일을 직접 업로드해 주세요.",
        )

    return str(path)
