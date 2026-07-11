import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic, AI_MODEL } from "@/lib/anthropic";
import { AI_SYSTEM_PROMPT } from "@/lib/ai-system-prompt";
import { AI_TOOLS, executeAiTool, getPlatformIndex, getPageContext, type Citation } from "@/lib/ai-tools";
import type Anthropic from "@anthropic-ai/sdk";

const bodySchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1).max(8000),
  page: z.string().max(500).nullable().optional(),
});

const MAX_TOOL_ITERATIONS = 6;
const MAX_HISTORY_MESSAGES = 40;

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

  let conversationId = parsed.data.conversationId;
  if (conversationId) {
    const conv = await prisma.aiConversation.findUnique({ where: { id: conversationId }, select: { userId: true } });
    if (!conv || conv.userId !== session.user.id) {
      return NextResponse.json({ error: "Nie znaleziono rozmowy." }, { status: 404 });
    }
  } else {
    const conv = await prisma.aiConversation.create({ data: { userId: session.user.id } });
    conversationId = conv.id;
  }

  const history = await prisma.aiMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: MAX_HISTORY_MESSAGES,
    select: { role: true, content: true },
  });

  await prisma.aiMessage.create({
    data: { conversationId, role: "user", content: parsed.data.message },
  });

  const messages: Anthropic.MessageParam[] = [
    ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user", content: parsed.data.message },
  ];

  const citations: Citation[] = [];
  let totalTokensUsed = 0;
  let finalText = "";

  try {
    const [platformIndex, pageContext] = await Promise.all([
      getPlatformIndex(),
      getPageContext(parsed.data.page),
    ]);
    const system = [AI_SYSTEM_PROMPT, platformIndex, pageContext].filter(Boolean).join("\n\n");

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const response = await anthropic.messages.create({
        model: AI_MODEL,
        max_tokens: 1024,
        system,
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

  await prisma.aiMessage.create({
    data: { conversationId, role: "assistant", content: finalText, citations: citations as unknown as object },
  });

  // Auto-tytuł rozmowy na podstawie pierwszej wiadomości użytkownika
  if (history.length === 0) {
    const title = parsed.data.message.slice(0, 60).trim() || "Nowa rozmowa";
    await prisma.aiConversation.update({ where: { id: conversationId }, data: { title } });
  } else {
    await prisma.aiConversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
  }

  const updated = await prisma.user.findUnique({ where: { id: session.user.id }, select: { aiTokens: true } });

  return NextResponse.json({
    conversationId,
    message: finalText,
    citations,
    tokensUsed: totalTokensUsed,
    tokensRemaining: updated?.aiTokens ?? 0,
  });
}
