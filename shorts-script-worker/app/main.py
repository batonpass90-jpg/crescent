import logging
from pathlib import Path
from typing import Optional

from fastapi import BackgroundTasks, Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.job_store import job_store
from app.models import HighlightCandidatesRequest, HighlightSelectionRequest, Job, JobStatus
from app.pipeline import run_download_pipeline, run_ingest_pipeline, run_trim_pipeline

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="shorts-script-worker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.allowed_origin],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def require_worker_secret(x_worker_secret: str = Header(default="")) -> None:
    if x_worker_secret != settings.worker_api_secret:
        raise HTTPException(status_code=401, detail="유효하지 않은 워커 인증입니다.")


def require_upload_token(x_worker_secret: str = Header(default="")) -> None:
    """파일 업로드(POST /jobs)는 브라우저가 워커에 직접 호출하므로,
    서버 전용 전체 시크릿 대신 노출되어도 되는 업로드 전용 토큰도 허용한다."""
    if x_worker_secret not in (settings.worker_api_secret, settings.worker_upload_token):
        raise HTTPException(status_code=401, detail="유효하지 않은 업로드 인증입니다.")


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/jobs", dependencies=[Depends(require_upload_token)])
async def create_job(
    background_tasks: BackgroundTasks,
    product_name: str = Form(...),
    source_url: Optional[str] = Form(default=None),
    file: Optional[UploadFile] = File(default=None),
):
    if not file and not source_url:
        raise HTTPException(400, "영상 파일 또는 링크 중 하나는 필수입니다.")
    if file and source_url:
        raise HTTPException(400, "파일과 링크는 동시에 입력할 수 없습니다.")

    job = Job(
        product_name=product_name,
        source_type="upload" if file else "url",
        source_url=source_url,
    )
    job_store.create(job)

    job_dir = Path(settings.data_dir) / job.id
    job_dir.mkdir(parents=True, exist_ok=True)

    if file is not None:
        suffix = Path(file.filename or "").suffix or ".mp4"
        dest_path = job_dir / f"source{suffix}"
        max_bytes = settings.max_upload_mb * 1024 * 1024
        size = 0
        try:
            with open(dest_path, "wb") as f:
                while chunk := await file.read(1024 * 1024):
                    size += len(chunk)
                    if size > max_bytes:
                        raise HTTPException(
                            413, f"업로드 용량은 최대 {settings.max_upload_mb}MB까지 가능합니다."
                        )
                    f.write(chunk)
        except HTTPException:
            dest_path.unlink(missing_ok=True)
            job_store.set_status(
                job.id, JobStatus.ERROR, f"업로드 용량이 {settings.max_upload_mb}MB를 초과했습니다."
            )
            raise

        job_store.update(job.id, video_path=str(dest_path))
        background_tasks.add_task(run_ingest_pipeline, job.id)
    else:
        background_tasks.add_task(run_download_pipeline, job.id, source_url, str(job_dir))

    return {"job_id": job.id, "status": job.status}


@app.get("/jobs/{job_id}", dependencies=[Depends(require_worker_secret)])
def get_job(job_id: str):
    job = job_store.get(job_id)
    if job is None:
        raise HTTPException(404, "존재하지 않는 작업입니다.")
    return job.public_dict()


@app.put("/jobs/{job_id}/highlight-candidates", dependencies=[Depends(require_worker_secret)])
def set_highlight_candidates(job_id: str, body: HighlightCandidatesRequest):
    """Next.js가 STT 결과로 Haiku 점수화를 마친 후보 구간을 저장해 프론트에서 다시 조회할 수 있게 한다."""
    job = job_store.get(job_id)
    if job is None:
        raise HTTPException(404, "존재하지 않는 작업입니다.")
    updated = job_store.update(job_id, highlight_candidates=body.candidates)
    return updated.public_dict()


@app.post("/jobs/{job_id}/highlight", dependencies=[Depends(require_worker_secret)])
def select_highlight(job_id: str, body: HighlightSelectionRequest, background_tasks: BackgroundTasks):
    job = job_store.get(job_id)
    if job is None:
        raise HTTPException(404, "존재하지 않는 작업입니다.")
    if not job.video_path:
        raise HTTPException(400, "원본 영상을 찾을 수 없습니다.")

    background_tasks.add_task(run_trim_pipeline, job_id, body.start_sec, body.end_sec)
    return {"job_id": job_id, "status": JobStatus.TRIMMING}
