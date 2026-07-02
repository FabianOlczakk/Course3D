"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface LessonTimestampData {
  time: number;
  label?: string;
  elementId: string;
}

export interface LessonData {
  id: string;
  title: string;
  description: string | null;
  extraDescription: string | null;
  videoUrl: string | null;
  contentJson: unknown;
  timestamps?: LessonTimestampData[] | null;
}

// "1:20,Nazwa,sekcja" (po jednym w linii) -> [{time, label, elementId}]
function parseTimestamps(text: string): LessonTimestampData[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [timeStr, label, elementId] = line.split(",").map((s) => s?.trim());
      const parts = (timeStr || "").split(":").map(Number);
      const time =
        parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0] || 0;
      return { time, label: label || "", elementId: elementId || "" };
    })
    .filter((t) => t.elementId && !Number.isNaN(t.time))
    .sort((a, b) => a.time - b.time);
}

function serializeTimestamps(ts?: LessonTimestampData[] | null): string {
  return (ts ?? [])
    .map((t) => {
      const m = Math.floor(t.time / 60);
      const s = Math.round(t.time % 60);
      return `${m}:${String(s).padStart(2, "0")},${t.label || ""},${t.elementId}`;
    })
    .join("\n");
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapterId: string;
  lesson?: LessonData | null;
  onSaved: () => void;
}

function contentToString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

export function LessonFormDialog({
  open,
  onOpenChange,
  chapterId,
  lesson,
  onSaved,
}: Props) {
  const editing = !!lesson;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [extraDescription, setExtraDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [content, setContent] = useState("");
  const [timestampsText, setTimestampsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) {
      setTitle(lesson?.title ?? "");
      setDescription(lesson?.description ?? "");
      setExtraDescription(lesson?.extraDescription ?? "");
      setVideoUrl(lesson?.videoUrl ?? "");
      setContent(contentToString(lesson?.contentJson));
      setTimestampsText(serializeTimestamps(lesson?.timestamps));
      setError(null);
    }
  }, [open, lesson]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const url = editing
        ? `/api/lessons/${lesson!.id}`
        : `/api/chapters/${chapterId}/lessons`;
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          extraDescription: extraDescription || null,
          videoUrl: videoUrl || null,
          contentJson: content || null,
          timestamps: parseTimestamps(timestampsText),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nie udało się zapisać lekcji.");
        return;
      }
      onOpenChange(false);
      onSaved();
    } catch {
      setError("Wystąpił błąd. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glow-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edytuj lekcję" : "Nowa lekcja"}</DialogTitle>
          <DialogDescription>
            Dodaj wideo i treść lekcji. Treść może zawierać HTML/Markdown.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ls-title">Tytuł</Label>
            <Input
              id="ls-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ls-desc">Opis</Label>
            <Textarea
              id="ls-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ls-video">URL wideo (YouTube lub bezpośredni)</Label>
            <Input
              id="ls-video"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ls-extra">Dodatkowy opis (pod wideo, pod przyciskami)</Label>
            <Textarea
              id="ls-extra"
              value={extraDescription}
              onChange={(e) => setExtraDescription(e.target.value)}
              rows={3}
              placeholder="Dodatkowe informacje, linki, materiały do pobrania… (obsługuje HTML)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ls-content">Treść lekcji (HTML / Markdown)</Label>
            <Textarea
              id="ls-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder={'<h2 id="kalibracja">Kalibracja</h2><p>...</p>'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ls-timestamps">
              Timestampy wideo (jeden na linię: <code>czas,nazwa,id-sekcji</code>)
            </Label>
            <Textarea
              id="ls-timestamps"
              value={timestampsText}
              onChange={(e) => setTimestampsText(e.target.value)}
              rows={5}
              placeholder={"0:00,Wstęp,wstep\n1:20,Kalibracja,kalibracja\n3:05,Pierwszy wydruk,pierwszy-wydruk"}
              className="font-mono text-xs"
            />
            <p className="text-xs text-text-muted">
              „id-sekcji" musi odpowiadać atrybutowi <code>id</code> elementu w
              treści (np. <code>&lt;h2 id=&quot;kalibracja&quot;&gt;</code>).
              Fioletowy kursor płynnie przejdzie do tej sekcji, gdy wideo
              osiągnie podany czas.
            </p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={loading} className="glow-btn text-white">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Zapisz
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
