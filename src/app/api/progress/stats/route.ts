import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/progress/stats — podsumowanie postępu użytkownika
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const chapters = await prisma.chapter.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      lessons: { select: { id: true } },
    },
  });

  const completedRows = await prisma.lessonProgress.findMany({
    where: { userId: session.user.id, completed: true },
    select: { lessonId: true },
  });
  const completedSet = new Set(completedRows.map((r) => r.lessonId));

  let total = 0;
  let completed = 0;
  const chapterStats = chapters.map((c) => {
    const chapterTotal = c.lessons.length;
    const chapterCompleted = c.lessons.filter((l) =>
      completedSet.has(l.id)
    ).length;
    total += chapterTotal;
    completed += chapterCompleted;
    return {
      chapterId: c.id,
      title: c.title,
      total: chapterTotal,
      completed: chapterCompleted,
    };
  });

  return NextResponse.json({ total, completed, chapters: chapterStats });
}
