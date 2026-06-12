import type { Metadata } from "next";
import Link from "next/link";
import { PlayCircle, BookOpen } from "lucide-react";
import { auth } from "@/lib/auth";
import {
  ProgressOverview,
  ChapterProgressBar,
} from "@/components/dashboard/progress-overview";

export const metadata: Metadata = {
  title: "Kurs Druku 3D",
};
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  const name = session?.user?.username || "Kursancie";

  const chapters = await prisma.chapter.findMany({
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, description: true },
      },
    },
  });

  const firstLesson = chapters.flatMap((c) => c.lessons)[0];

  return (
    <div className="p-4 md:p-6 space-y-8">
      <div className="glow-card glow-border relative overflow-hidden p-8">
        <h1 className="text-3xl font-bold text-text-primary">Witaj, {name}!</h1>
        <p className="mt-1 text-text-secondary">
          Kontynuuj naukę druku 3D z drukarką Bambu Lab A1 Mini.
        </p>
        {firstLesson && (
          <Link
            href={`/kurs/${firstLesson.id}`}
            className="glow-btn mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
          >
            <PlayCircle className="h-4 w-4" />
            Kontynuuj naukę
          </Link>
        )}
      </div>

      <ProgressOverview />

      <div>
        <h2 className="mb-4 text-xl font-bold text-text-primary">Twój kurs</h2>

        {chapters.length === 0 ? (
          <div className="glow-card p-8 text-center text-text-secondary">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-text-muted" />
            Brak rozdziałów. Administrator wkrótce doda kurs.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="glow-card p-6">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-2xl">{chapter.iconUrl || "📘"}</span>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-text-primary">
                      {chapter.title}
                    </h3>
                    <p className="text-xs text-text-muted">
                      {chapter.lessons.length} lekcji
                    </p>
                  </div>
                </div>
                {chapter.description && (
                  <p className="mb-3 text-sm text-text-secondary">
                    {chapter.description}
                  </p>
                )}
                <ChapterProgressBar chapterId={chapter.id} />
                <ul className="mt-3 space-y-1">
                  {chapter.lessons.map((lesson) => (
                    <li key={lesson.id}>
                      <Link
                        href={`/kurs/${lesson.id}`}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-secondary transition-colors hover:bg-[var(--bg-elevated)] hover:text-text-primary"
                      >
                        <PlayCircle className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                        <span className="min-w-0 flex-1 truncate">
                          {lesson.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                  {chapter.lessons.length === 0 && (
                    <li className="px-2 py-1.5 text-sm text-text-muted">
                      Brak lekcji w tym rozdziale.
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
