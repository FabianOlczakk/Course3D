"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Paperclip, Plus, X } from "lucide-react";
import {
  readAttachments,
  formatFileSize,
  type Attachment,
} from "@/lib/attachments-client";
import type { CategoryMini, PostItem } from "@/components/community/types";

// Formularz tworzenia nowego posta.
export function NewPostForm({ onCreated }: { onCreated: (post: PostItem) => void }) {
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [categories, setCategories] = useState<CategoryMini[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/categories?type=POST")
      .then((r) => (r.ok ? r.json() : { categories: [] }))
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {});
  }, []);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    try {
      const next = await readAttachments(files, attachments.length);
      setAttachments((prev) => [...prev, ...next]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Błąd pliku.");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function submit() {
    const text = content.trim();
    if (!text) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, attachments, categoryId: categoryId || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Nie udało się dodać posta.");
        return;
      }
      const data = await res.json();
      setContent("");
      setAttachments([]);
      setCategoryId("");
      onCreated(data.post);
    } catch {
      setError("Nie udało się dodać posta.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="glow-card p-4">
      {error && <p className="mb-2 text-sm text-red-400">{error}</p>}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="📝 Napisz post..."
        className="w-full resize-none rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {attachments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {attachments.map((a, i) => (
            <span
              key={i}
              className="flex items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-1 text-xs text-text-secondary"
            >
              {a.name} ({formatFileSize(a.size)})
              <button
                type="button"
                aria-label="Usuń"
                onClick={() =>
                  setAttachments((prev) => prev.filter((_, idx) => idx !== i))
                }
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="mt-2 flex items-center justify-between">
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="glow-icon-btn"
            aria-label="Dodaj załącznik"
            onClick={() => fileRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </button>
          {categories.length > 0 && (
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-9 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 text-sm text-text-primary outline-none"
            >
              <option value="">Bez kategorii</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <button
          type="button"
          disabled={submitting || !content.trim()}
          onClick={() => void submit()}
          className="glow-btn flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
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
