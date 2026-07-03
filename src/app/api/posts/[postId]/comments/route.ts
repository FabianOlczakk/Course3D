import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { attachmentsSchema } from "@/lib/attachments";
import { notifyComment } from "@/lib/notifications";
import { attachMentions, encodeMentions } from "@/lib/mentions";
import { maskActivity } from "@/lib/online-status";

const authorSelect = {
  select: { id: true, username: true, email: true, avatarUrl: true, role: true, lastActiveAt: true, activityPrivate: true },
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

  const viewerId = session.user.id;
  const viewerIsAdmin = session.user.role === "ADMIN";

  const comments = await prisma.comment.findMany({
    where: { postId: params.postId },
    orderBy: { createdAt: "asc" },
    include: { author: authorSelect },
  });

  // Głosy komentarzy — zbiorczo dla wszystkich komentarzy posta.
  const commentIds = comments.map((c) => c.id);
  const [voteCounts, myVotes] = await Promise.all([
    commentIds.length
      ? prisma.commentVote.groupBy({
          by: ["commentId", "value"],
          where: { commentId: { in: commentIds } },
          _count: true,
        })
      : Promise.resolve([] as { commentId: string; value: "UP" | "DOWN"; _count: number }[]),
    commentIds.length
      ? prisma.commentVote.findMany({
          where: { commentId: { in: commentIds }, userId: viewerId },
          select: { commentId: true, value: true },
        })
      : Promise.resolve([] as { commentId: string; value: "UP" | "DOWN" }[]),
  ]);
  const myVoteByComment = new Map(myVotes.map((v) => [v.commentId, v.value]));

  function wilsonScore(up: number, down: number): number {
    const n = up + down;
    if (n === 0) return 0;
    const z = 1.96;
    const p = up / n;
    return (p + (z * z) / (2 * n) - z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n)) / (1 + (z * z) / n);
  }

  const enriched = comments.map((c) => {
    const up = voteCounts.find((v) => v.commentId === c.id && v.value === "UP")?._count ?? 0;
    const down = voteCounts.find((v) => v.commentId === c.id && v.value === "DOWN")?._count ?? 0;
    return {
      ...c,
      author: maskActivity(c.author, viewerId, viewerIsAdmin),
      votes: { up, down, myVote: myVoteByComment.get(c.id) ?? null },
      _score: wilsonScore(up, down),
    };
  });

  // Sortuj komentarze: top-level po popularności, odpowiedzi chronologicznie.
  const topLevel = enriched.filter((c) => !c.parentId).sort((a, b) => b._score - a._score);
  const replies = enriched.filter((c) => !!c.parentId);
  const sorted = [...topLevel, ...replies];

  // Wzmianki: migracja starych @nazwa → znaczniki + mapa ID → użytkownik.
  const { items: withMentions, mentions } = await attachMentions(
    sorted.map((c) => ({ id: c.id, content: c.content })),
    (id, content) => prisma.comment.update({ where: { id }, data: { content } })
  );
  const contentById = new Map(withMentions.map((i) => [i.id, i.content]));
  const result = sorted.map(({ _score: _s, ...c }) => ({
    ...c,
    content: contentById.get(c.id) ?? c.content,
    mentions,
  }));

  return NextResponse.json({ comments: result });
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
      return NextResponse.json(
        { error: "Nie znaleziono komentarza nadrzędnego." },
        { status: 400 }
      );
    }
  }

  const encoded = await encodeMentions(parsed.data.content);

  const created = await prisma.comment.create({
    data: {
      authorId: session.user.id,
      postId: params.postId,
      parentId: parsed.data.parentId || null,
      content: encoded,
      attachments: parsed.data.attachments ?? undefined,
    },
    include: { author: authorSelect },
  });

  const { mentions } = await attachMentions([{ id: created.id, content: created.content }]);
  const { author, ...restComment } = created;
  const comment = {
    ...restComment,
    author: maskActivity(author, session.user.id, session.user.role === "ADMIN"),
    votes: { up: 0, down: 0, myVote: null },
    mentions,
  };

  // Powiadomienia w tle
  void notifyComment({
    actorId: session.user.id,
    postId: params.postId,
    commentId: comment.id,
    content: parsed.data.content,
    postAuthorId: post.authorId,
    parentAuthorId,
  });

  return NextResponse.json({ comment }, { status: 201 });
}
