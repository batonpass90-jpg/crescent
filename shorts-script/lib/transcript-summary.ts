import { complete, MODELS } from "@/lib/claude";
import type { TranscriptSegment } from "@/lib/types";

/**
 * STT 원문은 참고자료일 뿐, 대본 생성 단계에는 절대 그대로 넘기지 않는다.
 * 언어 감지 + (필요시) 번역 + 핵심 포인트만 남기는 요약을 Haiku로 수행한다.
 */
export async function summarizeTranscript(
  segments: TranscriptSegment[],
  language: string | null
): Promise<string> {
  if (segments.length === 0) {
    return "(인식된 발화 없음 — 무음이거나 배경음악 위주 영상일 수 있음)";
  }

  const raw = segments.map((s) => s.text).join(" ");
  const prompt = `아래는 영상에서 추출한 원문 발화(언어: ${language ?? "알 수 없음"})다. 이 영상이 어떤 내용을 다루는지, 어떤 소구 포인트를 썼는지 핵심만 한국어로 5줄 이내 불릿으로 요약해라. 원문 문장을 그대로 옮기지 말고 내용만 요약해라.

원문:
${raw}`;

  const summary = await complete({
    model: MODELS.HAIKU,
    system: "너는 영상 스크립트 요약가다. 원문 표현을 그대로 옮기지 않고 내용만 한국어로 요약한다.",
    prompt,
    maxTokens: 512,
  });

  return summary.trim() || "(요약 실패 — 원문 없이 진행)";
}
