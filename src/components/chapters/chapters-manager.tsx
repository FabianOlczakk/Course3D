"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  ListVideo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ChapterFormDialog,
  type ChapterData,
} from "@/components/chapters/chapter-form-dialog";

export interface ManagedChapter extends ChapterData {
  order: number;
  lessonCount: number;
}

export function ChaptersManager({ initial }: { initial: ManagedChapter[] }) {
  const [chapters, setChapters] = useState<ManagedChapter[]>(initial);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ChapterData | null>(null);
  const [busy, setBusy] = useState(false);

  async function reload() {
    const res = await fetch("/api/chapters");
    if (!res.ok) return;
    const data = await res.json();
    type ApiChapter = ChapterData & {
      order: number;
      lessons: unknown[];
    };
    setChapters(
      (data.chapters as ApiChapter[]).map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        iconUrl: c.iconUrl,
        order: c.order,
        lessonCount: c.lessons?.length ?? 0,
      }))
    );
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Usunąć rozdział „${title}” wraz z lekcjami?`)) return;
    const res = await fetch(`/api/chapters/${id}`, { method: "DELETE" });
    if (res.ok) reload();
    else alert("Nie udało się usunąć rozdziału.");
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= chapters.length) return;
    setBusy(true);
    const a = chapters[index];
    const b = chapters[target];
    await Promise.all([
      fetch(`/api/chapters/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/chapters/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: a.order }),
      }),
    ]);
    await reload();
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Rozdziały</h1>
          <p className="text-text-secondary">
            Zarządzaj rozdziałami i kolejnością kursu.
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
          Nowy rozdział
        </Button>
      </div>

      {chapters.length === 0 ? (
        <div className="glow-card p-8 text-center text-text-secondary">
          Brak rozdziałów. Dodaj pierwszy rozdział, aby rozpocząć.
        </div>
      ) : (
        <div className="space-y-3">
          {chapters.map((ch, i) => (
            <div
              key={ch.id}
              className="glow-card flex items-center gap-4 p-4"
            >
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
                  disabled={i === chapters.length - 1 || busy}
                  onClick={() => move(i, 1)}
                  className="glow-icon-btn h-7 w-7 disabled:opacity-30"
                  aria-label="W dół"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>

              <span className="text-2xl">{ch.iconUrl || "📘"}</span>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-text-primary">
                  {ch.title}
                </p>
                <p className="truncate text-sm text-text-secondary">
                  {ch.lessonCount} lekcji
                  {ch.description ? ` · ${ch.description}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/chapters/${ch.id}/lessons`}>
                    <ListVideo className="h-4 w-4" />
                    Lekcje
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setEditing(ch);
                    setDialogOpen(true);
                  }}
                  aria-label="Edytuj"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(ch.id, ch.title)}
                  aria-label="Usuń"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ChapterFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        chapter={editing}
        onSaved={reload}
      />
    </div>
  );
}
