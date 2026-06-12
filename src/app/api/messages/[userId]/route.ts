import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { attachmentsSchema } from "@/lib/attachments";

// Wiadomości pomiędzy bieżącym użytkownikiem a :userId (rosnąco wg daty).
export async function GET(
  _req: Request,
  { params }: { params: { userId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }
  const me = session.user.id;
  const other = params.userId;

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: me, receiverId: other },
        { senderId: other, receiverId: me },
      ],
    },
    orderBy: { createdAt: "asc" },
    include: {
      sender: {
        select: { id: true, username: true, email: true, avatarUrl: true },
      },
    },
  });

  return NextResponse.json({ messages });
}

const sendSchema = z.object({
  content: z.string().trim().max(5000).optional().default(""),
  attachments: attachmentsSchema,
});

// Wyślij wiadomość do :userId.
export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }
  const me = session.user.id;
  const receiverId = params.userId;

  if (receiverId === me) {
    return NextResponse.json(
      { error: "Nie możesz wysłać wiadomości do siebie." },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }

  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Nieprawidłowe dane." },
      { status: 400 }
    );
  }

  const { content, attachments } = parsed.data;
  if (!content && (!attachments || attachments.length === 0)) {
    return NextResponse.json(
      { error: "Wiadomość nie może być pusta." },
      { status: 400 }
    );
  }

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) {
    return NextResponse.json(
      { error: "Nie znaleziono odbiorcy." },
      { status: 404 }
    );
  }

  const message = await prisma.message.create({
    data: {
      senderId: me,
      receiverId,
      content,
      attachments: attachments ?? undefined,
    },
    include: {
      sender: {
        select: { id: true, username: true, email: true, avatarUrl: true },
      },
    },
  });

  return NextResponse.json({ message }, { status: 201 });
}
