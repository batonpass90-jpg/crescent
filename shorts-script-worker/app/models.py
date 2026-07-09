import time
import uuid
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


class JobStatus(str, Enum):
    QUEUED = "queued"
    DOWNLOADING = "downloading"
    DOWNLOAD_FAILED = "download_failed"
    TRANSCRIBING = "transcribing"
    ANALYZING_SCENES = "analyzing_scenes"
    AWAITING_HIGHLIGHT_SELECTION = "awaiting_highlight_selection"
    TRIMMING = "trimming"
    READY = "ready"
    ERROR = "error"
    TIMEOUT = "timeout"


class Job(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    product_name: str
    source_type: str  # "upload" | "url"
    source_url: Optional[str] = None
    status: JobStatus = JobStatus.QUEUED
    error_message: Optional[str] = None

    video_path: Optional[str] = None
    duration_sec: Optional[float] = None
    is_longform: Optional[bool] = None

    language: Optional[str] = None
    transcript_segments: Optional[list[dict[str, Any]]] = None
    has_subtitle_track: bool = False

    highlight_candidates: Optional[list[dict[str, Any]]] = None
    selected_highlight: Optional[dict[str, Any]] = None
    trimmed_video_path: Optional[str] = None

    scenes: Optional[list[dict[str, Any]]] = None

    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)

    def public_dict(self) -> dict[str, Any]:
        """내부 파일 경로 등을 제외한, 클라이언트에 노출해도 되는 필드만."""
        data = self.model_dump(exclude={"video_path", "trimmed_video_path"})
        return data


class HighlightCandidatesRequest(BaseModel):
    candidates: list[dict[str, Any]]


class HighlightSelectionRequest(BaseModel):
    start_sec: float
    end_sec: float
