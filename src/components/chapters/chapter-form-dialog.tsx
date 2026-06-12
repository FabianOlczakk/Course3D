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

export interface ChapterData {
  id: string;
  title: string;
  description: string | null;
  iconUrl: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapter?: ChapterData | null;
  onSaved: () => void;
}

export function ChapterFormDialog({
  open,
  onOpenChange,
  chapter,
  onSaved,
}: Props) {
  const editing = !!chapter;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(chapter?.title ?? "");
      setDescription(chapter?.description ?? "");
      setIcon(chapter?.iconUrl ?? "");
      setError(null);
    }
  }, [open, chapter]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const url = editing ? `/api/chapters/${chapter!.id}` : "/api/chapters";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          icon: icon || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nie udało się zapisać rozdziału.");
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
      <DialogContent className="glow-card">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edytuj rozdział" : "Nowy rozdział"}
          </DialogTitle>
          <DialogDescription>
            Rozdziały grupują lekcje kursu.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ch-title">Tytuł</Label>
            <Input
              id="ch-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ch-icon">Ikona (emoji)</Label>
            <Input
              id="ch-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="np. 🖨️"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ch-desc">Opis</Label>
            <Textarea
              id="ch-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
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
