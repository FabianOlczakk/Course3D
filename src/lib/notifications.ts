import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

// Wyodrębnij @username z treści
export function extractMentions(content: string): string[] {
  const matches = content.match(/@([\w.]+)/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(1)))];
}

// Rozwiąż nazwy użytkowników na ID
async function resolveUsernames(usernames: string[]): Promise<Map<string, string>> {
  if (!usernames.length) return new Map();
  const users = await prisma.user.findMany({
    where: { username: { in: usernames } },
    select: { id: true, username: true },
  });
  return new Map(users.map((u) => [u.username!, u.id]));
}

// Utwórz powiadomienia dla wzmianek w poście
export async function notifyPostMentions(
  actorId: string,
  postId: string,
  content: string
) {
  const names = extractMentions(content);
  if (!names.length) return;
  const map = await resolveUsernames(names);
  const recipients = [...map.values()].filter((id) => id !== actorId);
  if (!recipients.length) return;
  await prisma.notification.createMany({
    data: recipients.map((userId) => ({
      userId,
      type: "MENTION_POST" as NotificationType,
      actorId,
      postId,
    })),
    skipDuplicates: true,
  });
}

// Utwórz powiadomienia dla komentarza
export async function notifyComment(opts: {
  actorId: string;
  postId: string;
  commentId: string;
  content: string;
  postAuthorId: string;
  parentAuthorId?: string;
}) {
  const { actorId, postId, commentId, content, postAuthorId, parentAuthorId } = opts;
  const notifications: { userId: string; type: NotificationType; actorId: string; postId: string; commentId: string }[] = [];

  // Odpowiedź na post (powiadom autora posta, jeśli to nie autor sam komtuje)
  if (postAuthorId !== actorId) {
    notifications.push({
      userId: postAuthorId,
      type: (parentAuthorId ? "REPLY_COMMENT" : "REPLY_POST") as NotificationType,
      actorId,
      postId,
      commentId,
    });
  }

  // Odpowiedź na komentarz
  if (parentAuthorId && parentAuthorId !== actorId && parentAuthorId !== postAuthorId) {
    notifications.push({
      userId: parentAuthorId,
      type: "REPLY_COMMENT" as NotificationType,
      actorId,
      postId,
      commentId,
    });
  }

  // Wzmianki @username
  const names = extractMentions(content);
  if (names.length) {
    const map = await resolveUsernames(names);
    for (const [, userId] of map) {
      if (userId !== actorId) {
        notifications.push({
          userId,
          type: "MENTION_COMMENT" as NotificationType,
          actorId,
          postId,
          commentId,
        });
      }
    }
  }

  if (notifications.length) {
    await prisma.notification.createMany({ data: notifications, skipDuplicates: true });
  }
}

// Nowa wiadomość
export async function notifyNewMessage(actorId: string, receiverId: string) {
  if (actorId === receiverId) return;
  await prisma.notification.create({
    data: {
      userId: receiverId,
      type: "NEW_MESSAGE",
      actorId,
    },
  });
}
