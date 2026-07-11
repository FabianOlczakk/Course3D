import Anthropic from "@anthropic-ai/sdk";

export const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// Claude Sonnet — dobry balans jakości/kosztu dla asystenta kursowego z tool use.
export const AI_MODEL = "claude-sonnet-4-5";
