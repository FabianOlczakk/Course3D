import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  ratingComment: z.string().max(1000).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma.lessonProgress as any).upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId: params.id } },
    create: {
      userId: session.user.id,
      lessonId: params.id,
      completed: true,
      rating: parsed.data.rating,
      ratingComment: parsed.data.ratingComment,
    },
    update: {
      rating: parsed.data.rating,
      ratingComment: parsed.data.ratingComment,
    },
  });

  return NextResponse.json({ ok: true });
}

// Admin: pobierz średnią ocen lekcji
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }

  const rows = await prisma.lessonProgress.findMany({
    where: { lessonId: params.id, rating: { not: null } },
    select: { rating: true },
  });

  const count = rows.length;
  const avg = count > 0
    ? Math.round((rows.reduce((s, r) => s + (r.rating ?? 0), 0) / count) * 10) / 10
    : null;

  return NextResponse.json({ avg, count });
}
