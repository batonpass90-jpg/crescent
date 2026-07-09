import { MODELS, completeStructured } from "@/lib/claude";
import type { HighlightCandidate, TranscriptSegment } from "@/lib/types";

const SILENCE_GAP_SEC = 1.2;
const MIN_WINDOW_SEC = 12;
const MAX_WINDOW_SEC = 45;

interface RawWindow {
  start_sec: number;
  end_sec: number;
  text: string;
  silence_gap_after_sec: number;
  words_per_sec: number;
}

/** 문단 분할: 무음 구간(뒤 정적)이 있고 최소 길이를 넘겼을 때, 혹은 최대 길이를 넘겼을 때 구간을 끊는다. */
function buildRawWindows(segments: TranscriptSegment[]): RawWindow[] {
  if (segments.length === 0) return [];

  const windows: RawWindow[] = [];
  let buf: TranscriptSegment[] = [segments[0]];

  const flush = (gapAfter: number) => {
    const start = buf[0].start;
    const end = buf[buf.length - 1].end;
    const text = buf
      .map((s) => s.text)
      .join(" ")
      .trim();
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const duration = Math.max(0.1, end - start);
    windows.push({
      start_sec: Number(start.toFixed(2)),
      end_sec: Number(end.toFixed(2)),
      text,
      silence_gap_after_sec: Number(Math.max(0, gapAfter).toFixed(2)),
      words_per_sec: Number((wordCount / duration).toFixed(2)),
    });
  };

  for (let i = 1; i < segments.length; i++) {
    const prev = segments[i - 1];
    const cur = segments[i];
    const gap = cur.start - prev.end;
    const bufDuration = buf[buf.length - 1].end - buf[0].start;

    const shouldBreak = (gap > SILENCE_GAP_SEC && bufDuration >= MIN_WINDOW_SEC) || bufDuration >= MAX_WINDOW_SEC;

    if (shouldBreak) {
      flush(gap);
      buf = [cur];
    } else {
      buf.push(cur);
    }
  }
  flush(0);
  return windows;
}

const CANDIDATE_SCHEMA = {
  type: "object",
  properties: {
    candidates: {
      type: "array",
      items: {
        type: "object",
        properties: {
          window_index: { type: "integer", description: "구간 목록에서의 인덱스(0부터 시작)" },
          score: { type: "integer", minimum: 1, maximum: 10 },
          summary: { type: "string", description: "이 구간이 무슨 내용인지 한 줄 요약" },
          reason: { type: "string", description: "왜 숏폼 하이라이트로 추천하는지" },
        },
        required: ["window_index", "score", "summary", "reason"],
      },
    },
  },
  required: ["candidates"],
};

/**
 * 롱폼 STT 구간을 문단 단위로 나누고 Haiku로 점수화해 상위 3~5개 하이라이트 후보를 고른다.
 * STT 원문은 참고자료일 뿐 그대로 대본에 쓰이지 않으므로, 여기서도 "점수화"만 하고
 * 최종 대본 생성(별도 Sonnet 단계)에는 원문 대신 요약만 넘어간다.
 */
export async function scoreHighlightCandidates(
  segments: TranscriptSegment[],
  productName: string
): Promise<HighlightCandidate[]> {
  const windows = buildRawWindows(segments);
  if (windows.length === 0) return [];

  const windowList = windows
    .map((w, i) => {
      const dur = (w.end_sec - w.start_sec).toFixed(1);
      return `[${i}] ${w.start_sec}s~${w.end_sec}s (길이 ${dur}s, 발화속도 ${w.words_per_sec}단어/초, 뒤 정적 ${w.silence_gap_after_sec}s)\n"${w.text}"`;
    })
    .join("\n\n");

  const prompt = `아래는 상품 "${productName}" 관련 롱폼 영상을 문단 단위로 나눈 발화 스크립트다. 각 구간이 "독립적으로 잘라내도 재미있거나 정보성이 있는지"를 1~10점으로 평가하고, 상위 3~5개 구간을 골라라.

평가 기준:
- 그 구간만 따로 봐도 맥락이 이해되는가
- 숫자/결과/반전 등 구체적 정보가 있는가
- 뒤 정적(silence_gap_after_sec)이 클수록 자연스러운 컷 포인트다 — 점수가 비슷하면 우선 고려
- 발화속도가 너무 느리면 지루하고, 너무 빠르면 따라가기 어려우니 감점 요인이다

구간 목록:
${windowList}`;

  const result = await completeStructured<{
    candidates: { window_index: number; score: number; summary: string; reason: string }[];
  }>({
    model: MODELS.HAIKU,
    system: "너는 쇼츠 편집 PD다. 롱폼 영상에서 숏폼으로 잘라낼 만한 구간을 고르는 게 임무다. 반드시 주어진 구간 인덱스 범위 안에서만 골라라.",
    prompt,
    toolName: "submit_highlight_candidates",
    toolDescription: "평가한 하이라이트 후보 구간 목록을 제출한다.",
    inputSchema: CANDIDATE_SCHEMA,
    maxTokens: 1536,
  });

  return result.candidates
    .filter((c) => windows[c.window_index])
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((c) => {
      const w = windows[c.window_index];
      return {
        start_sec: w.start_sec,
        end_sec: w.end_sec,
        summary: c.summary,
        reason: c.reason,
        score: c.score,
      };
    });
}
