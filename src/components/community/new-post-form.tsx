"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import type { CategoryMini, PostItem } from "@/components/community/types";

// Formularz tworzenia nowego posta.
export function NewPostForm({ onCreated }: { onCreated: (post: PostItem) => void }) {
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState<CategoryMini[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categories?type=POST")
      .then((r) => (r.ok ? r.json() : { categories: [] }))
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {});
  }, []);

  async function submit() {
    const text = content.trim();
    if (!text) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, categoryId: categoryId || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Nie udało się dodać posta.");
        return;
      }
      const data = await res.json();
      setContent("");
      setCategoryId("");
      onCreated(data.post);
    } catch {
      setError("Nie udało się dodać posta.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-[10px] border border-[#2b2b2b] bg-[#1e1e1e] p-4">
      {error && <p className="mb-2 text-sm text-red-400">{error}</p>}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="Zadaj pytanie lub pokaż swój wydruk..."
        className="w-full resize-none rounded-md border border-[#2e2e2e] bg-[#141414] px-3 py-2 text-sm text-text-primary placeholder:text-[#6e6e6e] focus:border-[var(--accent)] focus:outline-none"
      />
      <div className="mt-2 flex items-center justify-between gap-2">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          title={
            categories.length === 0
              ? "Brak kategorii — instruktor może je dodać w zakładkach (Zarządzaj)"
              : "Wybierz kategorię"
          }
          className="h-9 rounded-md border border-[#2e2e2e] bg-[#141414] px-2 text-sm text-text-primary outline-none focus:border-[var(--accent)]"
        >
          <option value="">
            {categories.length === 0 ? "Brak kategorii" : "Bez kategorii"}
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={submitting || !content.trim()}
          onClick={() => void submit()}
          className="glow-btn flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Opublikuj
        </button>
      </div>
    </div>
  );
}
