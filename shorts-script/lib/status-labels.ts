import type { JobStatus } from "@/lib/types";

export const STATUS_LABELS: Record<JobStatus, string> = {
  queued: "대기 중",
  downloading: "영상 다운로드 중",
  download_failed: "다운로드 실패",
  transcribing: "음성 인식(STT) 중",
  analyzing_scenes: "장면 분석 중",
  awaiting_highlight_selection: "하이라이트 구간 선택 대기",
  trimming: "하이라이트 구간 편집 중",
  ready: "완료",
  error: "오류 발생",
  timeout: "처리 시간 초과",
};

export const ERROR_STATUSES: JobStatus[] = ["download_failed", "error", "timeout"];

export const PROCESSING_STATUSES: JobStatus[] = [
  "queued",
  "downloading",
  "transcribing",
  "analyzing_scenes",
  "trimming",
];
