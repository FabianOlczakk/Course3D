import { prisma } from "@/lib/prisma";

/**
 * Statystyki nauki użytkownika używane na pulpicie i w gamifikacji.
 * - completed: liczba ukończonych lekcji
 * - total: liczba wszystkich lekcji
 * - streak: liczba kolejnych dni (do dziś) z aktywnością w nauce
 * - rank / rankTotal: pozycja w rankingu wg ukończonych lekcji
 */
export async function getLearnerStats(userId: string) {
  const [completedRows, totalLessons, grouped, totalUsers] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId, completed: true },
      select: { updatedAt: true },
    }),
    prisma.lesson.count(),
    prisma.lessonProgress.groupBy({
      by: ["userId"],
      where: { completed: true },
      _count: { _all: true },
    }),
    prisma.user.count(),
  ]);

  const completed = completedRows.length;

  // Passa: kolejne dni wstecz od dziś z jakąkolwiek ukończoną lekcją.
  const days = new Set(
    completedRows.map((r) => r.updatedAt.toISOString().slice(0, 10))
  );
  let streak = 0;
  const cursor = new Date();
  // dopuszczamy brak aktywności dziś — liczymy od wczoraj, jeśli trzeba
  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Ranking wg liczby ukończonych lekcji (malejąco).
  const sorted = [...grouped].sort((a, b) => b._count._all - a._count._all);
  const idx = sorted.findIndex((g) => g.userId === userId);
  const rank = idx === -1 ? sorted.length + 1 : idx + 1;

  return { completed, total: totalLessons, streak, rank, rankTotal: totalUsers };
}
