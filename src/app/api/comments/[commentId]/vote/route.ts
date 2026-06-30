import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ value: z.enum(["UP", "DOWN"]) });

// Głosowanie (like/dislike) na komentarzu — analogicznie do głosów na poście.
export async function POST(
  req: Request,
  { params }: { params: { commentId: string } }
) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Brak autoryzacji" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Nieprawidłowe dane" }, { status: 400 });

  const { commentId } = params;
  const userId = session.user.id;
  const { value } = parsed.data;

  const exists = await prisma.comment.findUnique({ where: { id: commentId }, select: { id: true } });
  if (!exists) return Response.json({ error: "Nie znaleziono komentarza" }, { status: 404 });

  const existing = await prisma.commentVote.findUnique({
    where: { userId_commentId: { userId, commentId } },
  });

  if (existing?.value === value) {
    // Ponowne kliknięcie — usuń głos.
    await prisma.commentVote.delete({ where: { userId_commentId: { userId, commentId } } });
  } else if (existing) {
    await prisma.commentVote.update({
      where: { userId_commentId: { userId, commentId } },
      data: { value },
    });
  } else {
    await prisma.commentVote.create({ data: { userId, commentId, value } });
  }

  const [up, down, myVote] = await Promise.all([
    prisma.commentVote.count({ where: { commentId, value: "UP" } }),
    prisma.commentVote.count({ where: { commentId, value: "DOWN" } }),
    prisma.commentVote.findUnique({
      where: { userId_commentId: { userId, commentId } },
      select: { value: true },
    }),
  ]);

  return Response.json({ up, down, myVote: myVote?.value ?? null });
}
