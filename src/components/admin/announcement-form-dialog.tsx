"use client";

import { useEffect, useState } from "react";
import { Loader2, Pin } from "lucide-react";
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
import { StyledSelect } from "@/components/ui/styled-select";

export interface AnnouncementData {
  id: string;
  title: string | null;
  content: string;
  pinned: boolean;
  category: { id: string; name: string; color: string | null } | null;
}

interface Category {
  id: string;
  name: string;
  color: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: AnnouncementData | null;
  categories: Category[];
  onSaved: () => void;
}

export function AnnouncementFormDialog({
  open,
  onOpenChange,
  announcement,
  categories,
  onSaved,
}: Props) {
  const editing = !!announcement;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [pinned, setPinned] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(announcement?.title ?? "");
      setContent(announcement?.content ?? "");
      setCategoryId(announcement?.category?.id ?? "");
      setPinned(announcement?.pinned ?? false);
      setError(null);
    }
  }, [open, announcement]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const url = editing
        ? `/api/announcements/${announcement!.id}`
        : "/api/announcements";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          categoryId: categoryId || null,
          pinned,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nie udało się zapisać ogłoszenia.");
        return;
      }
      onOpenChange(false);
      onSaved();
    } catch {
      setError("Wystąpił błąd. Spróbuj ponownie.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glow-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edytuj ogłoszenie" : "Nowe ogłoszenie"}
          </DialogTitle>
          <DialogDescription>
            Treść może zawierać HTML. Kategoria i pinning są opcjonalne.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ann-title">Tytuł</Label>
            <Input
              id="ann-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ann-content">Treść (HTML)</Label>
            <Textarea
              id="ann-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="<p>Treść ogłoszenia...</p>"
              required
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <StyledSelect
              className="w-[220px]"
              value={categoryId}
              onChange={setCategoryId}
              placeholder="Bez kategorii"
              options={[
                { value: "", label: "Bez kategorii" },
                ...categories.map((c) => ({
                  value: c.id,
                  label: c.name,
                  color: c.color,
                })),
              ]}
            />
            <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-text-secondary">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                  pinned
                    ? "border-[var(--accent)] bg-[var(--accent)]"
                    : "border-[#2e2e2e] bg-[#141414]"
                }`}
              >
                {pinned && (
                  <Pin className="h-3 w-3 text-white" fill="currentColor" />
                )}
              </span>
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="sr-only"
              />
              Przypnij na górze
            </label>
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
            <Button
              type="submit"
              disabled={saving}
              className="glow-btn text-white"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Zapisz
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
