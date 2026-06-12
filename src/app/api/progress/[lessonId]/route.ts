import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const upsertSchema = z.object({
  completed: z.boolean().optional(),
  watchedSeconds: z.number().int().min(0).optional(),
});

// POST /api/progress/[lessonId] — upsert postępu lekcji
export async function POST(
  req: Request,
  { params }: { params: { lessonId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Nieprawidłowe dane." },
      { status: 400 }
    );
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    select: { id: true },
  });
  if (!lesson) {
    return NextResponse.json(
      { error: "Nie znaleziono lekcji." },
      { status: 404 }
    );
  }

  const { completed, watchedSeconds } = parsed.data;

  const progress = await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId: session.user.id,
        lessonId: params.lessonId,
      },
    },
    create: {
      userId: session.user.id,
      lessonId: params.lessonId,
      completed: completed ?? false,
      watchedSeconds: watchedSeconds ?? 0,
    },
    update: {
      ...(completed !== undefined ? { completed } : {}),
      ...(watchedSeconds !== undefined ? { watchedSeconds } : {}),
    },
    select: { lessonId: true, completed: true, watchedSeconds: true },
  });

  return NextResponse.json(progress);
}
