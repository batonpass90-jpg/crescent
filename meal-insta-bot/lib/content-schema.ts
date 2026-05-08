export const CARD_CONTENT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    cards: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          headline: { type: "string" },
          body: { type: "string" },
          image_concept: { type: "string" },
        },
        required: ["headline", "body", "image_concept"],
      },
    },
    caption: { type: "string" },
    hashtags: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["title", "cards", "caption", "hashtags"],
} as const;

export const CARD_COUNT = 5;
