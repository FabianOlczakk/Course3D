import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/lessons/[id]/navigation — poprzednia / następna lekcja
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    select: { id: true, order: true, chapterId: true },
  });
  if (!lesson) {
    return NextResponse.json(
      { error: "Nie znaleziono lekcji." },
      { status: 404 }
    );
  }

  // Wszystkie lekcje w kolejności globalnej (rozdział -> kolejność lekcji).
  const chapters = await prisma.chapter.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      lessons: {
        orderBy: { order: "asc" },
        select: { id: true, title: true },
      },
    },
  });

  const flat = chapters.flatMap((c) => c.lessons);
  const idx = flat.findIndex((l) => l.id === lesson.id);

  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;

  return NextResponse.json({
    prev: prev ? { id: prev.id, title: prev.title } : null,
    next: next ? { id: next.id, title: next.title } : null,
  });
}
