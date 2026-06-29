"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Paperclip, Plus, X } from "lucide-react";
import { StyledSelect } from "@/components/ui/styled-select";
import type { CategoryMini, PostItem } from "@/components/community/types";
import {
  readAttachments,
  formatFileSize,
  type Attachment,
} from "@/lib/attachments-client";

// Formularz tworzenia nowego posta.
export function NewPostForm({ onCreated }: { onCreated: (post: PostItem) => void }) {
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState<CategoryMini[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
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
        body: JSON.stringify({
          content: text,
          categoryId: categoryId || null,
          attachments,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Nie udało się dodać posta.");
        return;
      }
      const data = await res.json();
      setContent("");
      setCategoryId("");
      setAttachments([]);
      onCreated(data.post);
    } catch {
      setError("Nie udało się dodać posta.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
      {error && <p className="mb-2 text-sm text-red-400">{error}</p>}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="Zadaj pytanie lub pokaż swój wydruk..."
        className="w-full resize-none rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-text-primary placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
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
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button
            type="button"
            className="glow-icon-btn h-9 w-9 shrink-0"
            aria-label="Dodaj załącznik"
            onClick={() => fileRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <StyledSelect
            className="w-[200px]"
            value={categoryId}
            onChange={setCategoryId}
            placeholder={categories.length === 0 ? "Brak kategorii" : "Bez kategorii"}
            options={[
              { value: "", label: "Bez kategorii" },
              ...categories.map((c) => ({ value: c.id, label: c.name, color: c.color })),
            ]}
          />
        </div>
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
