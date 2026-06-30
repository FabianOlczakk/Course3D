import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { commentId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const value = body.value as "UP" | "DOWN" | undefined;
  if (value !== "UP" && value !== "DOWN") {
    return NextResponse.json({ error: "Nieprawidłowa wartość głosu." }, { status: 400 });
  }

  const userId = session.user.id;
  const commentId = params.commentId;

  const existing = await prisma.commentVote.findUnique({
    where: { userId_commentId: { userId, commentId } },
  });

  if (existing?.value === value) {
    await prisma.commentVote.delete({ where: { userId_commentId: { userId, commentId } } });
  } else if (existing) {
    await prisma.commentVote.update({ where: { userId_commentId: { userId, commentId } }, data: { value } });
  } else {
    await prisma.commentVote.create({ data: { userId, commentId, value } });
  }

  const counts = await prisma.commentVote.groupBy({
    by: ["value"],
    where: { commentId },
    _count: true,
  });
  const myVoteRow = await prisma.commentVote.findUnique({
    where: { userId_commentId: { userId, commentId } },
    select: { value: true },
  });

  return NextResponse.json({
    up: counts.find((c) => c.value === "UP")?._count ?? 0,
    down: counts.find((c) => c.value === "DOWN")?._count ?? 0,
    myVote: myVoteRow?.value ?? null,
  });
}
