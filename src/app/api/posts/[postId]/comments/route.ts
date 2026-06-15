import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { attachmentsSchema } from "@/lib/attachments";

const authorSelect = {
  select: { id: true, username: true, email: true, avatarUrl: true, role: true, lastActiveAt: true },
} as const;

// Wszystkie komentarze posta (płaska lista z parentId — drzewo budowane po stronie klienta).
export async function GET(
  _req: Request,
  { params }: { params: { postId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const comments = await prisma.comment.findMany({
    where: { postId: params.postId },
    orderBy: { createdAt: "asc" },
    include: { author: authorSelect },
  });

  return NextResponse.json({ comments });
}

const createSchema = z.object({
  content: z.string().trim().min(1, "Treść nie może być pusta.").max(10000),
  parentId: z.string().optional(),
  attachments: attachmentsSchema,
});

// Utwórz komentarz (opcjonalnie odpowiedź na inny komentarz).
export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Nieprawidłowe dane." },
      { status: 400 }
    );
  }

  const post = await prisma.post.findUnique({
    where: { id: params.postId },
    select: { id: true },
  });
  if (!post) {
    return NextResponse.json({ error: "Nie znaleziono posta." }, { status: 404 });
  }

  if (parsed.data.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parsed.data.parentId },
      select: { postId: true },
    });
    if (!parent || parent.postId !== params.postId) {
      return NextResponse.json(
        { error: "Nie znaleziono komentarza nadrzędnego." },
        { status: 400 }
      );
    }
  }

  const comment = await prisma.comment.create({
    data: {
      authorId: session.user.id,
      postId: params.postId,
      parentId: parsed.data.parentId || null,
      content: parsed.data.content,
      attachments: parsed.data.attachments ?? undefined,
    },
    include: { author: authorSelect },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
