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

export interface LessonData {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  contentJson: unknown;
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
  const [videoUrl, setVideoUrl] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(lesson?.title ?? "");
      setDescription(lesson?.description ?? "");
      setVideoUrl(lesson?.videoUrl ?? "");
      setContent(contentToString(lesson?.contentJson));
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
          videoUrl: videoUrl || null,
          contentJson: content || null,
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
            <Label htmlFor="ls-content">Treść lekcji (HTML / Markdown)</Label>
            <Textarea
              id="ls-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="<h2>Wstęp</h2><p>...</p>"
            />
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
