"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Megaphone, X } from "lucide-react";
import { timeAgo } from "@/lib/format-time";

interface Announcement {
  id: string;
  title: string | null;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string | null;
    email: string;
  };
}

// Panel ogłoszeń wysuwany z prawej strony. Treść renderowana w iframe
// (obsługa HTML/CSS/JS, tak jak treść lekcji).
export function AnnouncementsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

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
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="glow-card animate-in slide-in-from-right relative z-10 flex h-full w-full max-w-[560px] flex-col rounded-none border-l border-[var(--border-glow)] duration-200">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
            <Megaphone className="h-5 w-5 text-[var(--accent)]" />
            Ogłoszenia
          </h2>
          <button className="glow-icon-btn" aria-label="Zamknij" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
            </div>
          )}
          {loaded && !loading && items.length === 0 && (
            <p className="py-8 text-center text-sm text-text-muted">
              Brak ogłoszeń.
            </p>
          )}
          {items.map((a) => (
            <article key={a.id} className="glow-card overflow-hidden p-0">
              <div className="border-b border-[var(--border-subtle)] p-4">
                <h3 className="text-base font-semibold text-text-primary">
                  {a.title || "Ogłoszenie"}
                </h3>
                <p className="mt-1 text-xs text-text-muted">
                  {a.author.username || a.author.email} · {timeAgo(a.createdAt)}
                </p>
              </div>
              <iframe
                srcDoc={a.content}
                sandbox="allow-scripts allow-same-origin"
                className="h-64 w-full border-0 bg-white"
                title={a.title || "Ogłoszenie"}
              />
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
