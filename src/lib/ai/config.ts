import { anthropic } from "@ai-sdk/anthropic";

export const alvinModel = anthropic("claude-opus-4-20250514");
export const MAX_OUTPUT_TOKENS = 1500; // Rich responses with markdown formatting
