import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Lista konwersacji: unikalni użytkownicy + ostatnia wiadomość + liczba nieprzeczytanych.
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }
  const me = session.user.id;

  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: me }, { receiverId: me }] },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, username: true, email: true, avatarUrl: true, role: true } },
      receiver: { select: { id: true, username: true, email: true, avatarUrl: true, role: true } },
    },
  });

  type Conv = {
    userId: string;
    username: string | null;
    email: string;
    avatarUrl: string | null;
    role: string;
    lastMessage: string;
    lastMessageAt: Date;
    unreadCount: number;
  };

  const map = new Map<string, Conv>();

  for (const m of messages) {
    const other = m.senderId === me ? m.receiver : m.sender;
    let conv = map.get(other.id);
    if (!conv) {
      conv = {
        userId: other.id,
        username: other.username,
        email: other.email,
        avatarUrl: other.avatarUrl,
        role: other.role,
        lastMessage: m.content,
        lastMessageAt: m.createdAt,
        unreadCount: 0,
      };
      map.set(other.id, conv);
    }
    // Wiadomości są posortowane malejąco — pierwsza napotkana to ostatnia.
    if (m.receiverId === me && !m.readAt) conv.unreadCount += 1;
  }

  return NextResponse.json({ conversations: Array.from(map.values()) });
}
