export type JobStatus =
  | "queued"
  | "downloading"
  | "download_failed"
  | "transcribing"
  | "analyzing_scenes"
  | "awaiting_highlight_selection"
  | "trimming"
  | "ready"
  | "error"
  | "timeout";

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface HighlightCandidate {
  start_sec: number;
  end_sec: number;
  summary: string;
  reason: string;
  score: number;
}

export interface ProductResearch {
  problem_solved: string;
  selling_points: string[];
  review_keywords: string[];
  verified_numbers: { label: string; value: string }[];
  sources: string[];
  /** 웹 검색으로 검증 가능한 정보를 충분히 찾지 못한 경우 — 대본에 근거 없는 스펙을 넣지 않도록 하는 플래그 */
  insufficient_data: boolean;
}

export interface ScriptRow {
  cut_no: number;
  timecode: string;
  visual: string;
  caption: string;
  note: string;
}

export interface GeneratedScript {
  hook_line: string;
  script_rows: ScriptRow[];
  estimated_runtime_sec: number;
  bgm_note: string;
}

export interface Scene {
  timestamp_sec: number;
  is_cut_point: boolean;
  has_person: boolean;
  has_text_overlay: boolean | null;
}

export interface WorkerJob {
  id: string;
  product_name: string;
  source_type: "upload" | "url";
  source_url: string | null;
  status: JobStatus;
  error_message: string | null;
  duration_sec: number | null;
  is_longform: boolean | null;
  language: string | null;
  transcript_segments: TranscriptSegment[] | null;
  has_subtitle_track: boolean;
  highlight_candidates: HighlightCandidate[] | null;
  selected_highlight: { start_sec: number; end_sec: number } | null;
  scenes: Scene[] | null;
  created_at: number;
  updated_at: number;
}
