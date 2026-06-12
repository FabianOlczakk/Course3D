import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Usuń własny komentarz (lub dowolny — jeśli administrator).
export async function DELETE(
  _req: Request,
  { params }: { params: { commentId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const comment = await prisma.comment.findUnique({
    where: { id: params.commentId },
    select: { authorId: true },
  });
  if (!comment) {
    return NextResponse.json(
      { error: "Nie znaleziono komentarza." },
      { status: 404 }
    );
  }

  if (comment.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id: params.commentId } });
  return NextResponse.json({ ok: true });
}
