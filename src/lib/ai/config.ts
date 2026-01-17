import { anthropic } from "@ai-sdk/anthropic";

export const alvinModel = anthropic("claude-sonnet-4-20250514");
export const MAX_OUTPUT_TOKENS = 500; // Keep responses concise
