import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

const userSelect = {
  select: { id: true, username: true, email: true, avatarUrl: true, role: true },
} as const;

// Admin: wszystkie wiadomości danego użytkownika pogrupowane w konwersacje (read-only).
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }

  const target = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, username: true, email: true, avatarUrl: true, role: true },
  });
  if (!target) {
    return NextResponse.json(
      { error: "Nie znaleziono użytkownika." },
      { status: 404 }
    );
  }

  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: target.id }, { receiverId: target.id }] },
    orderBy: { createdAt: "asc" },
    include: { sender: userSelect, receiver: userSelect },
  });

  return NextResponse.json({ user: target, messages });
}
