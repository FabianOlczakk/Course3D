"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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

/**
 * Akordeon rozdziałów w pasku bocznym. Tylko jeden rozdział otwarty naraz.
 */
export function ChapterList({ chapters }: { chapters: SidebarChapter[] }) {
  const pathname = usePathname();
  const activeChapter = chapters.find((c) =>
    c.lessons.some((l) => pathname === `/kurs/${l.id}`)
  );
  const [openId, setOpenId] = useState<string | null>(
    activeChapter?.id ?? chapters[0]?.id ?? null
  );

  if (chapters.length === 0) {
    return (
      <p className="px-3 py-2 text-xs text-text-muted">
        Brak rozdziałów. Wkrótce pojawią się tutaj lekcje.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {chapters.map((chapter) => {
        const open = openId === chapter.id;
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
            {open && (
              <div className="ml-3 mt-1 space-y-0.5 border-l border-[var(--border-subtle)] pl-2">
                {chapter.lessons.length === 0 ? (
                  <p className="px-2 py-1 text-xs text-text-muted">
                    Brak lekcji
                  </p>
                ) : (
                  chapter.lessons.map((lesson) => {
                    const active = pathname === `/kurs/${lesson.id}`;
                    return (
                      <Link
                        key={lesson.id}
                        href={`/kurs/${lesson.id}`}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                          active
                            ? "bg-[var(--accent-glow)] text-text-primary"
                            : "text-text-secondary hover:bg-[var(--bg-elevated)] hover:text-text-primary"
                        )}
                      >
                        <PlayCircle className="h-3.5 w-3.5 shrink-0" />
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
