import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const conversation = await prisma.aiConversation.findUnique({
    where: { id: params.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conversation || conversation.userId !== session.user.id) {
    return NextResponse.json({ error: "Nie znaleziono rozmowy." }, { status: 404 });
  }
  return NextResponse.json({ conversation });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const conversation = await prisma.aiConversation.findUnique({ where: { id: params.id }, select: { userId: true } });
  if (!conversation || conversation.userId !== session.user.id) {
    return NextResponse.json({ error: "Nie znaleziono rozmowy." }, { status: 404 });
  }
  await prisma.aiConversation.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
