"use client";

import { useCallback, useEffect, useState } from "react";

export interface ProgressEntry {
  lessonId: string;
  completed: boolean;
  watchedSeconds: number;
}

export type ProgressMap = Record<string, ProgressEntry>;

/**
 * Hook pobierający i aktualizujący postęp użytkownika.
 * Nasłuchuje zdarzenia "progress:update", aby synchronizować
 * stan między komponentami (np. widok lekcji i pasek boczny).
 */
export function useProgress() {
  const [map, setMap] = useState<ProgressMap>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/progress");
      if (!res.ok) return;
      const data = (await res.json()) as { progress: ProgressEntry[] };
      const next: ProgressMap = {};
      for (const p of data.progress) next[p.lessonId] = p;
      setMap(next);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const handler = () => void load();
    window.addEventListener("progress:update", handler);
    return () => window.removeEventListener("progress:update", handler);
  }, [load]);

  return { progress: map, loading, reload: load };
}

/** Powiadom inne komponenty, że postęp się zmienił. */
export function broadcastProgressUpdate() {
  window.dispatchEvent(new Event("progress:update"));
}
