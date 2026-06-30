import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const actorSelect = {
  select: { id: true, username: true, email: true, avatarUrl: true },
} as const;

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Brak autoryzacji" }, { status: 401 });

  const [notifications, unreadMessages] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        actor: actorSelect,
        post: { select: { id: true, title: true, content: true } },
        comment: { select: { id: true, postId: true, content: true } },
      },
    }),
    prisma.message.count({ where: { receiverId: session.user.id, readAt: null } }),
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length + unreadMessages;

  return Response.json({ notifications, unreadMessages, unreadCount });
}
