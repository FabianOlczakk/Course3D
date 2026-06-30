import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: { postId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }
  const [post, voteCounts, myVoteRow] = await Promise.all([
    prisma.post.findUnique({
      where: { id: params.postId },
      include: {
        author: {
          select: { id: true, username: true, email: true, avatarUrl: true, role: true, lastActiveAt: true },
        },
        category: { select: { id: true, name: true, color: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.postVote.groupBy({
      by: ["value"],
      where: { postId: params.postId },
      _count: true,
    }),
    prisma.postVote.findUnique({
      where: { userId_postId: { userId: session.user.id, postId: params.postId } },
      select: { value: true },
    }),
  ]);
  if (!post) {
    return NextResponse.json({ error: "Nie znaleziono posta." }, { status: 404 });
  }
  const up = voteCounts.find((v) => v.value === "UP")?._count ?? 0;
  const down = voteCounts.find((v) => v.value === "DOWN")?._count ?? 0;
  return NextResponse.json({
    post: { ...post, votes: { up, down, myVote: myVoteRow?.value ?? null } },
  });
}

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
