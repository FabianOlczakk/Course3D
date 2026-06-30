import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ value: z.enum(["UP", "DOWN"]) });

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Brak autoryzacji" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Nieprawidłowe dane" }, { status: 400 });

  const { postId } = params;
  const userId = session.user.id;
  const { value } = parsed.data;

  const existing = await prisma.postVote.findUnique({ where: { userId_postId: { userId, postId } } });

  if (existing?.value === value) {
    // Toggle off — remove vote
    await prisma.postVote.delete({ where: { userId_postId: { userId, postId } } });
  } else if (existing) {
    // Change direction
    await prisma.postVote.update({ where: { userId_postId: { userId, postId } }, data: { value } });
  } else {
    await prisma.postVote.create({ data: { userId, postId, value } });
  }

  const [up, down, myVote] = await Promise.all([
    prisma.postVote.count({ where: { postId, value: "UP" } }),
    prisma.postVote.count({ where: { postId, value: "DOWN" } }),
    prisma.postVote.findUnique({ where: { userId_postId: { userId, postId } }, select: { value: true } }),
  ]);

  return Response.json({ up, down, myVote: myVote?.value ?? null });
}
