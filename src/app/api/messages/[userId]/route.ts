import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { attachmentsSchema } from "@/lib/attachments";
import { getSystemUserId } from "@/lib/system-user";

// Wiadomości pomiędzy bieżącym użytkownikiem a :userId (rosnąco wg daty).
// Administrator widzi też wiadomości SYSTEM↔:userId scalone w tym samym wątku
// (oznaczone fromSystem), aby móc śledzić anonimowe wiadomości.
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
  const isAdmin = session.user.role === "ADMIN";
  const systemId = isAdmin ? await getSystemUserId() : null;

  const or = [
    { senderId: me, receiverId: other },
    { senderId: other, receiverId: me },
  ];
  if (systemId && systemId !== me) {
    or.push(
      { senderId: systemId, receiverId: other },
      { senderId: other, receiverId: systemId }
    );
  }

  const rows = await prisma.message.findMany({
    where: { OR: or },
    orderBy: { createdAt: "asc" },
    include: {
      sender: {
        select: { id: true, username: true, email: true, avatarUrl: true, role: true },
      },
    },
  });

  const messages = rows.map((m) => ({
    ...m,
    fromSystem: systemId ? m.senderId === systemId : false,
  }));

  return NextResponse.json({ messages });
}

const sendSchema = z.object({
  content: z.string().trim().max(5000).optional().default(""),
  attachments: attachmentsSchema,
  asSystem: z.boolean().optional(),
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

  const { content, attachments, asSystem } = parsed.data;
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

  // Wysyłka incognito jako „SYSTEM" — tylko dla administratora.
  const senderId =
    asSystem && session.user.role === "ADMIN" ? await getSystemUserId() : me;

  const message = await prisma.message.create({
    data: {
      senderId,
      receiverId,
      content,
      attachments: attachments ?? undefined,
    },
    include: {
      sender: {
        select: { id: true, username: true, email: true, avatarUrl: true, role: true },
      },
    },
  });

  return NextResponse.json({ message }, { status: 201 });
}
