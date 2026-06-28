"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LessonFormDialog,
  type LessonData,
} from "@/components/lessons/lesson-form-dialog";
import { CopyLinkButton } from "@/components/shared/copy-link-button";

export interface ManagedLesson extends LessonData {
  order: number;
}

interface Props {
  chapterId: string;
  chapterTitle: string;
  initial: ManagedLesson[];
}

export function LessonsManager({ chapterId, chapterTitle, initial }: Props) {
  const [lessons, setLessons] = useState<ManagedLesson[]>(initial);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LessonData | null>(null);
  const [busy, setBusy] = useState(false);

  async function reload() {
    const res = await fetch(`/api/chapters/${chapterId}/lessons`);
    if (!res.ok) return;
    const data = await res.json();
    setLessons(data.lessons as ManagedLesson[]);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Usunąć lekcję „${title}”?`)) return;
    const res = await fetch(`/api/lessons/${id}`, { method: "DELETE" });
    if (res.ok) reload();
    else alert("Nie udało się usunąć lekcji.");
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= lessons.length) return;
    setBusy(true);
    const a = lessons[index];
    const b = lessons[target];
    await Promise.all([
      fetch(`/api/lessons/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/lessons/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: a.order }),
      }),
    ]);
    await reload();
    setBusy(false);
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Link
        href="/admin/chapters"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Powrót do rozdziałów
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Lekcje: {chapterTitle}
          </h1>
          <p className="text-text-secondary">
            Zarządzaj lekcjami w tym rozdziale.
          </p>
        </div>
        <Button
          className="glow-btn text-white"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Nowa lekcja
        </Button>
      </div>

      {lessons.length === 0 ? (
        <div className="glow-card p-8 text-center text-text-secondary">
          Brak lekcji. Dodaj pierwszą lekcję do tego rozdziału.
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((ls, i) => (
            <div key={ls.id} className="glow-card flex items-center gap-4 p-4">
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  disabled={i === 0 || busy}
                  onClick={() => move(i, -1)}
                  className="glow-icon-btn h-7 w-7 disabled:opacity-30"
                  aria-label="W górę"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={i === lessons.length - 1 || busy}
                  onClick={() => move(i, 1)}
                  className="glow-icon-btn h-7 w-7 disabled:opacity-30"
                  aria-label="W dół"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-text-primary">
                  {ls.title}
                </p>
                <p className="truncate text-sm text-text-secondary">
                  {ls.videoUrl ? "Wideo · " : "Bez wideo · "}
                  {ls.description || "Brak opisu"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" asChild aria-label="Kopiuj link">
                  <span>
                    <CopyLinkButton
                      path={`/kurs/${ls.id}`}
                      className="flex h-4 w-4 items-center justify-center text-text-secondary hover:text-[var(--accent-soft)]"
                    />
                  </span>
                </Button>
                <Button variant="outline" size="icon" asChild aria-label="Podgląd">
                  <Link href={`/kurs/${ls.id}`}>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setEditing(ls);
                    setDialogOpen(true);
                  }}
                  aria-label="Edytuj"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(ls.id, ls.title)}
                  aria-label="Usuń"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <LessonFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        chapterId={chapterId}
        lesson={editing}
        onSaved={reload}
      />
    </div>
  );
}
