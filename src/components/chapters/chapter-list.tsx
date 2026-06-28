"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Check, Circle, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/use-progress";

export interface SidebarLesson {
  id: string;
  title: string;
}

export interface SidebarChapter {
  id: string;
  title: string;
  iconUrl?: string | null;
  lessons: SidebarLesson[];
}

type LessonStatus = "completed" | "in-progress" | "not-started";

function StatusIcon({ status }: { status: LessonStatus }) {
  if (status === "completed") {
    return <Check className="h-3.5 w-3.5 shrink-0 text-green-400" />;
  }
  if (status === "in-progress") {
    return <CircleDot className="h-3.5 w-3.5 shrink-0 text-yellow-400" />;
  }
  return <Circle className="h-3.5 w-3.5 shrink-0 text-text-muted" />;
}

/**
 * Akordeon rozdziałów w pasku bocznym ze wskaźnikami postępu.
 */
export function ChapterList({
  chapters,
  onNavigate,
}: {
  chapters: SidebarChapter[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { progress } = useProgress();
  const activeChapter = chapters.find((c) =>
    c.lessons.some((l) => pathname === `/kurs/${l.id}`)
  );
  const [openId, setOpenId] = useState<string | null>(
    activeChapter?.id ?? chapters[0]?.id ?? null
  );

  if (chapters.length === 0) {
    return (
      <p className="px-3 py-2 text-xs text-text-muted">
        Brak rozdziałów. Administrator wkrótce doda kurs.
      </p>
    );
  }

  const lessonStatus = (lessonId: string): LessonStatus => {
    const p = progress[lessonId];
    if (!p) return "not-started";
    if (p.completed) return "completed";
    if (p.watchedSeconds > 0) return "in-progress";
    return "not-started";
  };

  return (
    <div className="space-y-1">
      {chapters.map((chapter) => {
        const open = openId === chapter.id;
        const total = chapter.lessons.length;
        const completed = chapter.lessons.filter(
          (l) => progress[l.id]?.completed
        ).length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        const done = total > 0 && completed === total;

        return (
          <div key={chapter.id}>
            <button
              type="button"
              onClick={() => setOpenId(open ? null : chapter.id)}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-text-secondary transition-colors hover:bg-[var(--bg-elevated)] hover:text-text-primary"
            >
              {chapter.iconUrl ? (
                <span className="text-base leading-none">{chapter.iconUrl}</span>
              ) : null}
              <span className="min-w-0 flex-1 truncate">{chapter.title}</span>
              <ChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform",
                  open && "rotate-90"
                )}
              />
            </button>

            {total > 0 && (
              <div className="px-3 pb-1">
                <p className="mb-1 text-[11px] text-text-muted">
                  {completed}/{total} lekcji ukończonych
                </p>
                <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      done
                        ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]"
                        : "bg-[var(--accent)]"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )}

            {open && (
              <div className="ml-2 mt-1 space-y-0.5 border-l-2 border-[#383838] pl-3">
                {chapter.lessons.length === 0 ? (
                  <p className="px-2 py-1 text-xs text-text-muted">
                    Brak lekcji w tym rozdziale.
                  </p>
                ) : (
                  chapter.lessons.map((lesson) => {
                    const active = pathname === `/kurs/${lesson.id}`;
                    return (
                      <Link
                        key={lesson.id}
                        href={`/kurs/${lesson.id}`}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                          active
                            ? "bg-[var(--accent-glow)] text-text-primary"
                            : "text-text-secondary hover:bg-[var(--bg-elevated)] hover:text-text-primary"
                        )}
                      >
                        <StatusIcon status={lessonStatus(lesson.id)} />
                        <span className="min-w-0 flex-1 truncate">
                          {lesson.title}
                        </span>
                      </Link>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
