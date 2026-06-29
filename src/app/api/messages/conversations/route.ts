import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getSystemUserId } from "@/lib/system-user";

const participantSelect = {
  select: { id: true, username: true, email: true, avatarUrl: true, role: true, lastActiveAt: true },
} as const;

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
      sender: { select: { id: true, username: true, email: true, avatarUrl: true, role: true, lastActiveAt: true } },
      receiver: { select: { id: true, username: true, email: true, avatarUrl: true, role: true, lastActiveAt: true } },
    },
  });

  type Conv = {
    userId: string;
    username: string | null;
    email: string;
    avatarUrl: string | null;
    role: string;
    lastActiveAt: Date | null;
    lastMessage: string;
    lastMessageAt: Date;
    unreadCount: number;
    system?: boolean;
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
        lastActiveAt: other.lastActiveAt,
        lastMessage: m.content,
        lastMessageAt: m.createdAt,
        unreadCount: 0,
      };
      map.set(other.id, conv);
    }
    // Wiadomości są posortowane malejąco — pierwsza napotkana to ostatnia.
    if (m.receiverId === me && !m.readAt) conv.unreadCount += 1;
  }

  const conversations: Conv[] = Array.from(map.values());

  // Wątki konta SYSTEM (gdzie admin nie jest uczestnikiem) — admin widzi je
  // scalone w zwykłej rozmowie z danym użytkownikiem, więc dodajemy tu tylko
  // te, których jeszcze nie ma na liście (np. gdy admin nigdy nie pisał 1:1).
  if (session.user.role === "ADMIN") {
    const systemId = await getSystemUserId();
    if (systemId !== me) {
      const sysMsgs = await prisma.message.findMany({
        where: { OR: [{ senderId: systemId }, { receiverId: systemId }] },
        orderBy: { createdAt: "desc" },
        include: { sender: participantSelect, receiver: participantSelect },
      });
      for (const m of sysMsgs) {
        const other = m.senderId === systemId ? m.receiver : m.sender;
        if (other.id === systemId || map.has(other.id)) continue;
        map.set(other.id, {
          userId: other.id,
          username: other.username,
          email: other.email,
          avatarUrl: other.avatarUrl,
          role: other.role,
          lastActiveAt: other.lastActiveAt,
          lastMessage: m.content,
          lastMessageAt: m.createdAt,
          unreadCount: 0,
        });
        conversations.push(map.get(other.id)!);
      }
    }
  }

  return NextResponse.json({ conversations });
}
