import { getAnthropic } from "./anthropic";
import { CARD_CONTENT_SCHEMA, CARD_COUNT } from "./content-schema";
import { SYSTEM_PROMPT, buildUserPrompt } from "./content-prompts";
import type {
  CardNewsContent,
  ContentCategory,
  GenerateContentResponse,
} from "./content-types";

const MODEL = "claude-sonnet-4-6";

function isCardNewsContent(value: unknown): value is CardNewsContent {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.title !== "string") return false;
  if (typeof v.caption !== "string") return false;
  if (!Array.isArray(v.hashtags) || !v.hashtags.every((t) => typeof t === "string")) {
    return false;
  }
  if (!Array.isArray(v.cards)) return false;
  return v.cards.every((c) => {
    if (!c || typeof c !== "object") return false;
    const card = c as Record<string, unknown>;
    return (
      typeof card.headline === "string" &&
      typeof card.body === "string" &&
      typeof card.image_concept === "string"
    );
  });
}

export async function generateContent(
  category: ContentCategory,
  date: string,
): Promise<GenerateContentResponse> {
  const client = getAnthropic();
  const userPrompt = buildUserPrompt(category, date);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
    // @ts-expect-error — output_config is supported on the API but may not be in this SDK's typings
    output_config: {
      format: {
        type: "json_schema",
        schema: CARD_CONTENT_SCHEMA,
      },
    },
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error(
      `No text block in response. stop_reason=${response.stop_reason}`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(textBlock.text);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Model returned invalid JSON: ${msg}\nRaw: ${textBlock.text.slice(0, 500)}`);
  }

  if (!isCardNewsContent(parsed)) {
    throw new Error(
      `Response did not match expected schema: ${JSON.stringify(parsed).slice(0, 500)}`,
    );
  }
  if (parsed.cards.length !== CARD_COUNT) {
    throw new Error(
      `Expected ${CARD_COUNT} cards, got ${parsed.cards.length}`,
    );
  }

  return {
    category,
    date,
    content: parsed,
    usage: {
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
      cache_read_input_tokens: response.usage.cache_read_input_tokens ?? undefined,
    },
  };
}
