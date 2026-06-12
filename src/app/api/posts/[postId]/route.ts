import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
