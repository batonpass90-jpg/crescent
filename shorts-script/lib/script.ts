import { completeStructured, MODELS } from "@/lib/claude";
import type { GeneratedScript, ProductResearch, Scene } from "@/lib/types";

const SCRIPT_SCHEMA = {
  type: "object",
  properties: {
    hook_line: { type: "string", description: "0~3초 후킹 문장" },
    script_rows: {
      type: "array",
      items: {
        type: "object",
        properties: {
          cut_no: { type: "integer" },
          timecode: { type: "string", description: '예: "0:00-0:03"' },
          visual: { type: "string", description: "화면 설명" },
          caption: { type: "string", description: "자막/나레이션. 8~12단어 내외 한 문장." },
          note: { type: "string", description: "후킹 포인트 등 비고" },
        },
        required: ["cut_no", "timecode", "visual", "caption", "note"],
      },
    },
    estimated_runtime_sec: { type: "integer" },
    bgm_note: { type: "string", description: "추천 배경음/템포 메모" },
  },
  required: ["hook_line", "script_rows", "estimated_runtime_sec", "bgm_note"],
};

const HOOK_RULES = `너는 트렌드에 맞는 후킹 강한 쇼츠 대본을 쓰는 카피라이터다. 아래 규칙을 반드시 지켜라.

- 3초 룰: 첫 3초 안에 검증 가능한 숫자, 결과, 반전이 들어가야 한다.
- 고객의 언어: 브랜드/마케팅 용어 금지. 실제 사람들이 후기 남길 때 쓰는 구어체, 감탄사, 줄임말을 써라.
- 역순 구조: 결과를 먼저 보여주고 → 과정/이유 설명 → 마지막에 담백한 행동 유도(CTA).
- 리스트형 포맷: 정보성 콘텐츠는 "N가지" 구조를 선호해라. 숫자가 후킹력을 높인다.
- 문장 길이: 한 컷(자막 단위)당 1문장, 8~12단어 내외로 짧게.
- 반발 정서/의외성: 예상 밖의 관점(반전, 솔직한 단점 언급 등)을 1곳 이상 넣어라.
- CTA는 담백하게: 과도한 광고 톤 금지, 담담한 선언체 유지.
- 상품 조사 결과에 없는 스펙/효능은 절대 넣지 마라 (근거 없는 과장 금지).
- 참고자료(원본 영상 요약)의 문장 구조나 표현을 그대로 복제하지 마라. 완전히 새로 써라.`;

const SELF_CHECK_RULES = `너는 방금 쓴 쇼츠 대본을 스스로 검수하는 편집자다. 최종 제출 전 아래 두 가지를 반드시 확인해라.

1. 모든 caption이 실제 고객이 쓸 법한 말투인지 다시 확인하고, 설명체/광고체로 남아있는 부분은 구어체로 고쳐라.
2. 원본 영상 요약과 표현이 겹치는 문장이 있는지 확인하고, 겹치면 완전히 다른 표현으로 바꿔라.

위 두 가지를 확인한 뒤, 기존 후킹 규칙(3초룰, 역순구조, 리스트형, 8~12단어, 반전 요소, 담백한 CTA, 근거 없는 스펙 금지)을 계속 지킨 최종 버전을 제출해라.`;

/** Claude 호출 없이 장면 메타데이터를 대본 프롬프트에 넣을 짧은 텍스트로 요약한다. */
export function summarizeScenes(scenes: Scene[] | null | undefined): string {
  if (!scenes || scenes.length === 0) return "(장면 분석 정보 없음)";

  const cutCount = scenes.filter((s) => s.is_cut_point).length;
  const personCount = scenes.filter((s) => s.has_person).length;
  const textCount = scenes.filter((s) => s.has_text_overlay).length;
  const personTimestamps = scenes
    .filter((s) => s.has_person)
    .map((s) => `${s.timestamp_sec}s`)
    .join(", ");

  return `총 ${scenes.length}개 프레임 분석 (약 2.5초 간격). 장면 전환 ${cutCount}회, 인물 등장 프레임 ${personCount}개(시점: ${personTimestamps || "없음"}), 텍스트 오버레이 감지 프레임 ${textCount}개.`;
}

interface GenerateScriptParams {
  productName: string;
  research: ProductResearch;
  transcriptSummary: string;
  scenesSummary: string;
  durationSec: number;
}

function buildContextPrompt(p: GenerateScriptParams): string {
  const numbers = p.research.verified_numbers.map((n) => `${n.label}: ${n.value}`).join(", ") || "없음";

  return `상품명: "${p.productName}"
소스 영상 길이: 약 ${Math.round(p.durationSec)}초

[상품 조사 결과 — 대본은 반드시 이 사실에만 근거해야 한다]
- 해결하는 문제: ${p.research.problem_solved || "확인 안 됨"}
- 핵심 셀링포인트: ${p.research.selling_points.join(", ") || "확인 안 됨"}
- 후기 반복 키워드: ${p.research.review_keywords.join(", ") || "확인 안 됨"}
- 검증된 숫자: ${numbers}
${p.research.insufficient_data ? "- 주의: 조사된 정보가 부족하다. 확인된 사실만 쓰고 나머지는 일반적인 표현으로 채워라." : ""}

[원본 영상 요약 — 참고자료일 뿐, 문장을 그대로 쓰면 안 됨]
${p.transcriptSummary}

[장면 분석 정보 — 화면 설명 작성에 참고]
${p.scenesSummary}`;
}

/** 초안 생성 → 자기검증 재작성의 2단계로 대본을 만든다. */
export async function generateScript(params: GenerateScriptParams): Promise<GeneratedScript> {
  const contextPrompt = buildContextPrompt(params);

  const draft = await completeStructured<GeneratedScript>({
    model: MODELS.SONNET,
    system: HOOK_RULES,
    prompt: `${contextPrompt}\n\n위 자료를 바탕으로 대본 초안을 작성해라.`,
    toolName: "submit_script",
    toolDescription: "완성된 쇼츠 대본을 제출한다.",
    inputSchema: SCRIPT_SCHEMA,
    maxTokens: 3000,
  });

  const refined = await completeStructured<GeneratedScript>({
    model: MODELS.SONNET,
    system: `${HOOK_RULES}\n\n${SELF_CHECK_RULES}`,
    prompt: `${contextPrompt}\n\n아래는 방금 쓴 초안이다. 자기검증 규칙에 따라 다듬어서 최종 버전을 제출해라.\n\n초안:\n${JSON.stringify(draft, null, 2)}`,
    toolName: "submit_script",
    toolDescription: "다듬어진 최종 쇼츠 대본을 제출한다.",
    inputSchema: SCRIPT_SCHEMA,
    maxTokens: 3000,
  });

  return refined;
}
