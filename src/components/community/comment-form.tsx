"use client";

import { useRef, useState } from "react";
import { Loader2, Paperclip, Send, X } from "lucide-react";
import {
  readAttachments,
  formatFileSize,
  type Attachment,
} from "@/lib/attachments-client";

// Formularz dodawania komentarza / odpowiedzi (inline).
export function CommentForm({
  postId,
  parentId,
  mention,
  onCreated,
  onCancel,
  autoFocus,
}: {
  postId: string;
  parentId?: string;
  mention?: string;
  onCreated: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const [content, setContent] = useState(mention ? `@${mention} ` : "");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, parentId, attachments }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Nie udało się dodać komentarza.");
        return;
      }
      setContent("");
      setAttachments([]);
      onCreated();
      onCancel?.();
    } catch {
      setError("Nie udało się dodać komentarza.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-2">
      {error && <p className="mb-1 text-xs text-red-400">{error}</p>}
      <div className="flex items-end gap-2">
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
        <textarea
          autoFocus={autoFocus}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={1}
          placeholder="Odpowiedz..."
          className="max-h-32 min-h-[2.25rem] flex-1 resize-none rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="button"
          className="glow-icon-btn h-9 w-9 shrink-0 disabled:opacity-50"
          aria-label="Wyślij"
          disabled={submitting}
          onClick={() => void submit()}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            className="glow-icon-btn h-9 w-9 shrink-0"
            aria-label="Anuluj"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {attachments.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-2">
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
    </div>
  );
}
