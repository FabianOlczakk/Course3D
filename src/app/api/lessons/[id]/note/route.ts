import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const note = await prisma.lessonNote.findUnique({
    where: { userId_lessonId: { userId: session.user.id, lessonId: params.id } },
    select: { content: true, updatedAt: true },
  });

  return NextResponse.json({ note });
}

const schema = z.object({ content: z.string().max(10000) });

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });

  const note = await prisma.lessonNote.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId: params.id } },
    create: { userId: session.user.id, lessonId: params.id, content: parsed.data.content },
    update: { content: parsed.data.content },
    select: { content: true, updatedAt: true },
  });

  return NextResponse.json({ note });
}
