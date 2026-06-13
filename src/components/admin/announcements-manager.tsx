"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { timeAgo } from "@/lib/format-time";

interface Announcement {
  id: string;
  title: string | null;
  content: string;
  createdAt: string;
}

export function AnnouncementsManager() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      if (res.ok) {
        const data = await res.json();
        setItems(data.announcements ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Nie udało się utworzyć ogłoszenia.");
        return;
      }
      setTitle("");
      setContent("");
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Usunąć to ogłoszenie?")) return;
    const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="glow-card space-y-4 p-6">
        <h2 className="text-lg font-semibold">Nowe ogłoszenie</h2>
        <div className="space-y-2">
          <Label htmlFor="ann-title">Tytuł</Label>
          <Input
            id="ann-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="np. Nowa lekcja dostępna!"
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
            placeholder="<h1>Witaj!</h1><p>Treść ogłoszenia...</p>"
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={saving}>
          {saving ? "Publikowanie..." : "Opublikuj ogłoszenie"}
        </Button>
      </form>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Opublikowane ogłoszenia</h2>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-text-muted">Brak ogłoszeń.</p>
        ) : (
          items.map((a) => (
            <div
              key={a.id}
              className="glow-card flex items-center justify-between gap-4 p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-text-primary">
                  {a.title || "Ogłoszenie"}
                </p>
                <p className="text-xs text-text-muted">{timeAgo(a.createdAt)}</p>
              </div>
              <button
                type="button"
                aria-label="Usuń ogłoszenie"
                className="text-text-muted transition-colors hover:text-red-400"
                onClick={() => void handleDelete(a.id)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
