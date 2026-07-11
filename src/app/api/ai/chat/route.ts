import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic, AI_MODEL } from "@/lib/anthropic";
import { AI_SYSTEM_PROMPT } from "@/lib/ai-system-prompt";
import { AI_TOOLS, executeAiTool, type Citation } from "@/lib/ai-tools";
import type Anthropic from "@anthropic-ai/sdk";

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(8000),
      })
    )
    .min(1)
    .max(40),
});

const MAX_TOOL_ITERATIONS = 6;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  if (!anthropic) {
    return NextResponse.json({ error: "Asystent AI nie jest skonfigurowany (brak ANTHROPIC_API_KEY)." }, { status: 503 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { aiTokens: true } });
  if (!user) return NextResponse.json({ error: "Nie znaleziono użytkownika." }, { status: 404 });
  if (user.aiTokens <= 0) {
    return NextResponse.json({ error: "Wyczerpano pulę tokenów AI. Skontaktuj się z administratorem." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Błąd walidacji." }, { status: 400 });
  }

  const messages: Anthropic.MessageParam[] = parsed.data.messages.map((m) => ({ role: m.role, content: m.content }));
  const citations: Citation[] = [];
  let totalTokensUsed = 0;
  let finalText = "";

  try {
    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const response = await anthropic.messages.create({
        model: AI_MODEL,
        max_tokens: 1024,
        system: AI_SYSTEM_PROMPT,
        tools: AI_TOOLS,
        messages,
      });

      totalTokensUsed += response.usage.input_tokens + response.usage.output_tokens;

      if (response.stop_reason !== "tool_use") {
        finalText = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("\n");
        break;
      }

      // Model chce użyć narzędzi — wykonaj je i dołóż wyniki do konwersacji.
      messages.push({ role: "assistant", content: response.content });
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type !== "tool_use") continue;
        const result = await executeAiTool(block.name, (block.input ?? {}) as Record<string, unknown>, citations);
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
      }
      messages.push({ role: "user", content: toolResults });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Nieznany błąd.";
    return NextResponse.json({ error: `Błąd asystenta AI: ${msg}` }, { status: 502 });
  } finally {
    if (totalTokensUsed > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { aiTokens: { decrement: totalTokensUsed } },
      });
    }
  }

  if (!finalText) {
    finalText = "Przepraszam, nie udało mi się wygenerować odpowiedzi. Spróbuj sformułować pytanie inaczej.";
  }

  const updated = await prisma.user.findUnique({ where: { id: session.user.id }, select: { aiTokens: true } });

  return NextResponse.json({
    message: finalText,
    citations,
    tokensUsed: totalTokensUsed,
    tokensRemaining: updated?.aiTokens ?? 0,
  });
}
