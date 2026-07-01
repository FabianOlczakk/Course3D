import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Star } from "lucide-react";

export const dynamic = "force-dynamic";

function StarBar({ avg, count }: { avg: number | null; count: number }) {
  if (count === 0) return <span className="text-[12px] text-[var(--text-muted)]">Brak ocen</span>;
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`h-3.5 w-3.5 ${s <= Math.round(avg ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-[var(--border-subtle)]"}`}
          />
        ))}
      </div>
      <span className="text-[13px] font-semibold text-[var(--text-primary)]">
        {avg?.toFixed(1)}
      </span>
      <span className="text-[11px] text-[var(--text-muted)]">({count} ocen)</span>
    </div>
  );
}

export default async function AdminOcenyPage() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") redirect("/dashboard");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chapters = await (prisma.chapter as any).findMany({
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: {
          progress: {
            where: { rating: { not: null } },
            select: { rating: true, ratingComment: true, user: { select: { username: true, email: true } } },
          },
        },
      },
    },
  }) as Array<{
    id: string; title: string; order: number;
    lessons: Array<{
      id: string; title: string; order: number;
      progress: Array<{ rating: number | null; ratingComment: string | null; user: { username: string | null; email: string } }>;
    }>;
  }>;

  function calcAvg(ratings: (number | null)[]): { avg: number | null; count: number } {
    const valid = ratings.filter((r): r is number => r !== null);
    if (!valid.length) return { avg: null, count: 0 };
    return { avg: valid.reduce((a, b) => a + b, 0) / valid.length, count: valid.length };
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 md:p-8">
      <div className="flex items-center gap-3">
        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        <h1 className="font-display text-[20px] font-semibold text-[var(--text-primary)]">Oceny lekcji</h1>
      </div>

      <div className="space-y-4">
        {chapters.map((chapter) => {
          const allRatings = chapter.lessons.flatMap((l) => l.progress.map((p) => p.rating));
          const chapterStats = calcAvg(allRatings);

          return (
            <div key={chapter.id} className="glow-card overflow-hidden">
              {/* Chapter header */}
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-5 py-3">
                <span className="font-semibold text-[var(--text-primary)]">{chapter.title}</span>
                <StarBar avg={chapterStats.avg} count={chapterStats.count} />
              </div>

              {/* Lessons */}
              <div className="divide-y divide-[var(--border-subtle)]">
                {chapter.lessons.map((lesson) => {
                  const lessonStats = calcAvg(lesson.progress.map((p) => p.rating));
                  return (
                    <div key={lesson.id} className="px-5 py-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-[var(--text-primary)]">
                            {lesson.order}. {lesson.title}
                          </p>
                          <div className="mt-1">
                            <StarBar avg={lessonStats.avg} count={lessonStats.count} />
                          </div>
                        </div>
                      </div>

                      {/* Individual ratings with comments */}
                      {lesson.progress.filter((p) => p.rating !== null).length > 0 && (
                        <div className="mt-3 space-y-1.5 pl-2 border-l-2 border-[var(--border-subtle)]">
                          {lesson.progress
                            .filter((p) => p.rating !== null)
                            .map((p, i) => (
                              <div key={i} className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <Star
                                        key={s}
                                        className={`h-3 w-3 ${s <= (p.rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-[var(--border-subtle)]"}`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[11px] text-[var(--text-muted)]">
                                    {p.user.username ?? p.user.email}
                                  </span>
                                </div>
                                {p.ratingComment && (
                                  <p className="text-[11.5px] text-[var(--text-secondary)] italic">
                                    &ldquo;{p.ratingComment}&rdquo;
                                  </p>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {chapter.lessons.length === 0 && (
                  <p className="px-5 py-4 text-[13px] text-[var(--text-muted)]">Brak lekcji</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
