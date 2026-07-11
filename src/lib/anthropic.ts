import Anthropic from "@anthropic-ai/sdk";

export const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// Claude Haiku — najtańszy dostępny model, wystarczający do prostego asystenta FAQ kursu z tool use.
export const AI_MODEL = "claude-haiku-4-5-20251001";
