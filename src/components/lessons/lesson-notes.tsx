"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Loader2, NotebookPen } from "lucide-react";

interface Props {
  lessonId: string;
}

export function LessonNotes({ lessonId }: Props) {
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/lessons/${lessonId}/note`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (cancelled) return;
        const text = data?.note?.content ?? "";
        setContent(text);
        setSavedContent(text);
        if (data?.note?.updatedAt) setLastSaved(new Date(data.note.updatedAt));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [lessonId]);

  const save = useCallback(async (text: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        setSavedContent(text);
        setLastSaved(new Date());
      }
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  }, [lessonId]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setContent(val);
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => void save(val), 1500);
  }

  const dirty = content !== savedContent;

  return (
    <div className="border-t border-[var(--border-subtle)] pt-4">
      <div className="mb-2 flex items-center gap-2">
        <NotebookPen className="h-4 w-4 text-[var(--accent)]" />
        <span className="text-[13px] font-semibold text-[var(--text-primary)]">Moje notatki</span>
        <span className="ml-auto flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
          {saving ? (
            <><Loader2 className="h-3 w-3 animate-spin" /> Zapisywanie…</>
          ) : dirty ? (
            "Niezapisane"
          ) : lastSaved ? (
            <><Check className="h-3 w-3 text-green-400" /> Zapisano</>
          ) : null}
        </span>
      </div>
      {loading ? (
        <div className="flex h-24 items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-[var(--text-muted)]" />
        </div>
      ) : (
        <textarea
          value={content}
          onChange={handleChange}
          rows={5}
          placeholder="Twoje prywatne notatki do tej lekcji…"
          className="w-full resize-y rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2.5 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
        />
      )}
    </div>
  );
}
