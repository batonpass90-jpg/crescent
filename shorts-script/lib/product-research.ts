import { completeStructured, getClaudeClient, MODELS } from "@/lib/claude";
import type { ProductResearch } from "@/lib/types";

const RESEARCH_SCHEMA = {
  type: "object",
  properties: {
    problem_solved: { type: "string", description: "이 상품이 해결하는 문제, 한두 문장" },
    selling_points: {
      type: "array",
      items: { type: "string" },
      description: "핵심 셀링포인트 1~2개",
    },
    review_keywords: {
      type: "array",
      items: { type: "string" },
      description: "실사용 후기에서 반복되는 키워드/불만/만족 포인트",
    },
    verified_numbers: {
      type: "array",
      items: {
        type: "object",
        properties: { label: { type: "string" }, value: { type: "string" } },
        required: ["label", "value"],
      },
      description: "검증 가능한 숫자 (용량, 함량, 가격, 사용기간 등)",
    },
    sources: { type: "array", items: { type: "string" }, description: "참고한 출처 URL" },
    insufficient_data: {
      type: "boolean",
      description: "검색으로 검증 가능한 정보를 충분히 찾지 못했으면 true",
    },
  },
  required: [
    "problem_solved",
    "selling_points",
    "review_keywords",
    "verified_numbers",
    "sources",
    "insufficient_data",
  ],
};

const EMPTY_RESULT: ProductResearch = {
  problem_solved: "",
  selling_points: [],
  review_keywords: [],
  verified_numbers: [],
  sources: [],
  insufficient_data: true,
};

/**
 * 1단계: web_search 툴로 실제 상품 정보를 조사한다(자유 텍스트).
 * 2단계: 그 결과를 Haiku로 구조화된 JSON으로 정리한다.
 * 두 단계로 나누는 이유: web_search와 강제 tool_choice(구조화 출력)는 한 호출에서 같이 쓸 수 없다.
 */
export async function researchProduct(productName: string): Promise<ProductResearch> {
  const searchRes = await getClaudeClient().messages.create({
    model: MODELS.HAIKU,
    max_tokens: 2048,
    system:
      "너는 이커머스 상품 리서처다. 주어진 상품명으로 실제 판매 페이지, 리뷰, 스토어 상세페이지를 검색해서 사실에 기반한 정보만 정리해라. 확실하지 않은 정보는 추측하지 말고 '확인 안 됨'이라고 밝혀라. 절대 근거 없는 스펙이나 효능을 지어내지 마라.",
    messages: [
      {
        role: "user",
        content: `상품명: "${productName}"

다음을 웹 검색으로 조사해줘:
1. 이 상품이 해결하는 문제
2. 핵심 셀링포인트 1~2개
3. 실사용 후기에서 반복되는 키워드/불만/만족 포인트
4. 검증 가능한 숫자(용량, 함량, 가격, 사용기간 등)
5. 참고한 출처 URL 목록`,
      },
    ],
    tools: [{ type: "web_search_20260318", name: "web_search", max_uses: 5 }],
  });

  const researchText = searchRes.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n\n");

  const sourceUrls = searchRes.content
    .filter((b) => b.type === "web_search_tool_result")
    .flatMap((b) => (Array.isArray(b.content) ? b.content : []))
    .map((r) => ("url" in r ? r.url : undefined))
    .filter((url): url is string => Boolean(url));

  if (!researchText.trim()) {
    return EMPTY_RESULT;
  }

  const structured = await completeStructured<ProductResearch>({
    model: MODELS.HAIKU,
    system: "아래 리서치 결과를 구조화된 형식으로 정리해라. 리서치에 없는 내용은 추측해서 채우지 마라.",
    prompt: `상품명: "${productName}"\n\n리서치 결과:\n${researchText}`,
    toolName: "submit_product_research",
    toolDescription: "구조화된 상품 조사 결과를 제출한다.",
    inputSchema: RESEARCH_SCHEMA,
    maxTokens: 1536,
  });

  return {
    ...structured,
    sources: structured.sources?.length ? structured.sources : Array.from(new Set(sourceUrls)),
  };
}
