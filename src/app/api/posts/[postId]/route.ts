import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { attachMentions } from "@/lib/mentions";
import { maskActivity } from "@/lib/online-status";

// Pojedynczy post (np. dla bezpośredniego linku).
export async function GET(
  _req: Request,
  { params }: { params: { postId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }
  const post = await prisma.post.findUnique({
    where: { id: params.postId },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
          role: true,
          lastActiveAt: true,
          activityPrivate: true,
        },
      },
      category: { select: { id: true, name: true, color: true } },
      _count: { select: { comments: true } },
    },
  });
  if (!post) {
    return NextResponse.json({ error: "Nie znaleziono posta." }, { status: 404 });
  }

  const userId = session.user.id;
  const [up, down, myVote] = await Promise.all([
    prisma.postVote.count({ where: { postId: post.id, value: "UP" } }),
    prisma.postVote.count({ where: { postId: post.id, value: "DOWN" } }),
    prisma.postVote.findUnique({
      where: { userId_postId: { userId, postId: post.id } },
      select: { value: true },
    }),
  ]);

  const { items, mentions } = await attachMentions(
    [{ id: post.id, content: post.content }],
    (id, content) => prisma.post.update({ where: { id }, data: { content } })
  );
  const { author, ...rest } = post;

  const enriched = {
    ...rest,
    content: items[0]?.content ?? post.content,
    author: maskActivity(author, userId, session.user.role === "ADMIN"),
    votes: { up, down, myVote: myVote?.value ?? null },
    mentions,
  };

  return NextResponse.json({ post: enriched });
}

// Usuń własny post (lub dowolny — jeśli administrator).
export async function DELETE(
  _req: Request,
  { params }: { params: { postId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const post = await prisma.post.findUnique({
    where: { id: params.postId },
    select: { authorId: true },
  });
  if (!post) {
    return NextResponse.json({ error: "Nie znaleziono posta." }, { status: 404 });
  }

  if (post.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }

  await prisma.post.delete({ where: { id: params.postId } });
  return NextResponse.json({ ok: true });
}
