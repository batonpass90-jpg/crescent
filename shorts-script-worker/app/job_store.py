import threading
import time
from typing import Optional

from app.models import Job, JobStatus


class JobStore:
    """단일 워커 프로세스 내 in-memory job 저장소. 팀 내부 도구 규모(동시 소수 요청)에는
    별도 DB/큐 없이 스레드-세이프 dict로 충분하다. 결과의 영구 보관은 Supabase(Next.js 쪽)가 담당."""

    def __init__(self) -> None:
        self._jobs: dict[str, Job] = {}
        self._lock = threading.Lock()

    def create(self, job: Job) -> Job:
        with self._lock:
            self._jobs[job.id] = job
        return job

    def get(self, job_id: str) -> Optional[Job]:
        with self._lock:
            return self._jobs.get(job_id)

    def update(self, job_id: str, **fields) -> Optional[Job]:
        with self._lock:
            job = self._jobs.get(job_id)
            if job is None:
                return None
            updated = job.model_copy(update={**fields, "updated_at": time.time()})
            self._jobs[job_id] = updated
            return updated

    def set_status(self, job_id: str, status: JobStatus, error_message: Optional[str] = None) -> Optional[Job]:
        return self.update(job_id, status=status, error_message=error_message)

    def purge_expired(self, ttl_hours: float) -> None:
        cutoff = time.time() - ttl_hours * 3600
        with self._lock:
            expired = [jid for jid, j in self._jobs.items() if j.created_at < cutoff]
            for jid in expired:
                del self._jobs[jid]


job_store = JobStore()
