import Anthropic from "@anthropic-ai/sdk";

export const MODELS = {
  // 번역/요약/조사정리/점수화 등 단순 작업 — 비용 최소화
  HAIKU: "claude-haiku-4-5-20251001",
  // 후킹 문장/대본 재작성 등 실제 창의적 판단이 필요한 작업
  SONNET: "claude-sonnet-5",
} as const;

let client: Anthropic | null = null;

export function getClaudeClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.");
    client = new Anthropic({ apiKey });
  }
  return client;
}

/** 텍스트 프롬프트를 보내고 첫 번째 text 블록만 돌려주는 단순 헬퍼 */
export async function complete(params: {
  model: string;
  system?: string;
  prompt: string;
  maxTokens?: number;
}): Promise<string> {
  const res = await getClaudeClient().messages.create({
    model: params.model,
    max_tokens: params.maxTokens ?? 2048,
    system: params.system,
    messages: [{ role: "user", content: params.prompt }],
  });
  const textBlock = res.content.find((b) => b.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text : "";
}

/** tool-use를 강제해 구조화된 JSON 응답을 받는 헬퍼 */
export async function completeStructured<T = unknown>(params: {
  model: string;
  system?: string;
  prompt: string;
  toolName: string;
  toolDescription: string;
  inputSchema: Record<string, unknown>;
  maxTokens?: number;
}): Promise<T> {
  const res = await getClaudeClient().messages.create({
    model: params.model,
    max_tokens: params.maxTokens ?? 2048,
    system: params.system,
    messages: [{ role: "user", content: params.prompt }],
    tools: [
      {
        name: params.toolName,
        description: params.toolDescription,
        input_schema: params.inputSchema as Anthropic.Tool.InputSchema,
      },
    ],
    tool_choice: { type: "tool", name: params.toolName },
  });

  const toolUse = res.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude가 구조화된 응답을 반환하지 않았습니다.");
  }
  return toolUse.input as T;
}
