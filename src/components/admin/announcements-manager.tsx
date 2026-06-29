"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Trash2, Pencil, Plus, Pin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StyledSelect } from "@/components/ui/styled-select";
import { timeAgo } from "@/lib/format-time";

interface Category {
  id: string;
  name: string;
  color: string | null;
}
interface Announcement {
  id: string;
  title: string | null;
  content: string;
  pinned: boolean;
  createdAt: string;
  category: Category | null;
}

export function AnnouncementsManager() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [pinned, setPinned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // zarządzanie kategoriami
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#9d6bff");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, c] = await Promise.all([
        fetch("/api/announcements"),
        fetch("/api/categories?type=ANNOUNCEMENT"),
      ]);
      if (a.ok) setItems((await a.json()).announcements ?? []);
      if (c.ok) setCategories((await c.json()).categories ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setContent("");
    setCategoryId("");
    setPinned(false);
  }

  function startEdit(a: Announcement) {
    setEditingId(a.id);
    setTitle(a.title ?? "");
    setContent(a.content);
    setCategoryId(a.category?.id ?? "");
    setPinned(a.pinned);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const url = editingId
        ? `/api/announcements/${editingId}`
        : "/api/announcements";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, categoryId: categoryId || null, pinned }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Nie udało się zapisać ogłoszenia.");
        return;
      }
      resetForm();
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

  async function addCategory() {
    const name = newCatName.trim();
    if (!name) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color: newCatColor, type: "ANNOUNCEMENT" }),
    });
    if (res.ok) {
      setNewCatName("");
      void load();
    }
  }
  async function deleteCategory(id: string) {
    if (!confirm("Usunąć kategorię?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) void load();
  }

  const accent = "bg-[var(--accent)] text-white hover:bg-[#8a5af0]";

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-4 md:p-6">
      {/* Kategorie ogłoszeń */}
      <div className="glow-card space-y-3 p-6">
        <h2 className="font-display text-lg font-semibold">Kategorie ogłoszeń</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c.id}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold"
              style={{ background: (c.color || "#9d6bff") + "1a", color: c.color || "#b89dff" }}
            >
              {c.name}
              <button onClick={() => void deleteCategory(c.id)} aria-label="Usuń">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {categories.length === 0 && (
            <span className="text-sm text-text-muted">Brak kategorii.</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Nazwa kategorii (np. Nowość)"
            className="flex-1"
          />
          <input
            type="color"
            value={newCatColor}
            onChange={(e) => setNewCatColor(e.target.value)}
            className="h-9 w-12 cursor-pointer rounded-md border border-[#2e2e2e] bg-transparent p-1 [&::-moz-color-swatch]:rounded [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
          />
          <button
            type="button"
            onClick={() => void addCategory()}
            className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold ${accent}`}
          >
            <Plus className="h-4 w-4" /> Dodaj
          </button>
        </div>
      </div>

      {/* Formularz ogłoszenia */}
      <form onSubmit={handleSubmit} className="glow-card space-y-4 p-6">
        <h2 className="font-display text-lg font-semibold">
          {editingId ? "Edytuj ogłoszenie" : "Nowe ogłoszenie"}
        </h2>
        <div className="space-y-2">
          <Label htmlFor="ann-title">Tytuł</Label>
          <Input id="ann-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
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
              ...categories.map((c) => ({ value: c.id, label: c.name, color: c.color })),
            ]}
          />
          <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-text-secondary">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                pinned ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[#2e2e2e] bg-[#141414]"
              }`}
            >
              {pinned && <Pin className="h-3 w-3 text-white" fill="currentColor" />}
            </span>
            <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="sr-only" />
            Przypnij na górze
          </label>
          <div className="ml-auto flex gap-2">
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Anuluj
              </Button>
            )}
            <button
              type="submit"
              disabled={saving}
              className={`inline-flex items-center gap-2 rounded-md px-5 py-2 text-sm font-semibold disabled:opacity-60 ${accent}`}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingId ? "Zapisz zmiany" : "Opublikuj"}
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Opublikowane ogłoszenia</h2>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-text-muted">Brak ogłoszeń.</p>
        ) : (
          items.map((a) => (
            <div key={a.id} className="glow-card flex items-center gap-3 p-4">
              {a.pinned && <Pin className="h-4 w-4 shrink-0 text-[var(--accent-soft)]" fill="currentColor" />}
              {a.category && (
                <span
                  className="shrink-0 rounded-md px-2 py-0.5 text-[10.5px] font-semibold"
                  style={{ background: (a.category.color || "#9d6bff") + "1a", color: a.category.color || "#b89dff" }}
                >
                  {a.category.name}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-text-primary">{a.title || "Ogłoszenie"}</p>
                <p className="text-xs text-text-muted">{timeAgo(a.createdAt)}</p>
              </div>
              <button
                type="button"
                aria-label="Edytuj"
                className="text-text-muted transition-colors hover:text-[var(--accent-soft)]"
                onClick={() => startEdit(a)}
              >
                <Pencil className="h-4 w-4" />
              </button>
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
