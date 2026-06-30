import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { attachmentsSchema } from "@/lib/attachments";
import { notifyComment } from "@/lib/notifications";

const authorSelect = {
  select: { id: true, username: true, email: true, avatarUrl: true, role: true, lastActiveAt: true },
} as const;

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

  // Dołącz liczby głosów i głos aktualnego użytkownika
  const commentIds = comments.map((c) => c.id);
  const [voteCounts, myVotes] = await Promise.all([
    prisma.commentVote.groupBy({
      by: ["commentId", "value"],
      where: { commentId: { in: commentIds } },
      _count: true,
    }),
    prisma.commentVote.findMany({
      where: { userId: session.user.id, commentId: { in: commentIds } },
      select: { commentId: true, value: true },
    }),
  ]);

  const myVoteMap = new Map(myVotes.map((v) => [v.commentId, v.value]));
  const enriched = comments.map((c) => ({
    ...c,
    votes: {
      up: voteCounts.filter((v) => v.commentId === c.id && v.value === "UP").reduce((s, v) => s + v._count, 0),
      down: voteCounts.filter((v) => v.commentId === c.id && v.value === "DOWN").reduce((s, v) => s + v._count, 0),
      myVote: myVoteMap.get(c.id) ?? null,
    },
  }));

  return NextResponse.json({ comments: enriched });
}

const createSchema = z.object({
  content: z.string().trim().min(1).max(10000),
  parentId: z.string().optional(),
  attachments: attachmentsSchema,
});

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Nieprawidłowe dane." }, { status: 400 });
  }

  const post = await prisma.post.findUnique({
    where: { id: params.postId },
    select: { id: true, authorId: true },
  });
  if (!post) {
    return NextResponse.json({ error: "Nie znaleziono posta." }, { status: 404 });
  }

  let parentAuthorId: string | undefined;
  if (parsed.data.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parsed.data.parentId },
      select: { postId: true, authorId: true },
    });
    parentAuthorId = parent?.authorId;
    if (!parent || parent.postId !== params.postId) {
      return NextResponse.json({ error: "Nie znaleziono komentarza nadrzędnego." }, { status: 400 });
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

  void notifyComment({
    actorId: session.user.id,
    postId: params.postId,
    commentId: comment.id,
    content: parsed.data.content,
    postAuthorId: post.authorId,
    parentAuthorId,
  });

  return NextResponse.json({ comment: { ...comment, votes: { up: 0, down: 0, myVote: null } } }, { status: 201 });
}
