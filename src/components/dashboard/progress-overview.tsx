"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChapterStat {
  chapterId: string;
  title: string;
  total: number;
  completed: number;
}

interface Stats {
  total: number;
  completed: number;
  chapters: ChapterStat[];
}

export function ProgressOverview() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/progress/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && !cancelled) setStats(data);
      })
      .catch(() => {});

    const handler = () => {
      fetch("/api/progress/stats")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && !cancelled) setStats(data);
        })
        .catch(() => {});
    };
    window.addEventListener("progress:update", handler);
    return () => {
      cancelled = true;
      window.removeEventListener("progress:update", handler);
    };
  }, []);

  if (!stats) {
    return (
      <div className="glow-card animate-pulse p-6">
        <div className="mb-3 h-5 w-48 rounded bg-[var(--bg-elevated)]" />
        <div className="h-3 w-full rounded-full bg-[var(--bg-elevated)]" />
      </div>
    );
  }

  if (stats.total === 0) return null;

  const pct = Math.round((stats.completed / stats.total) * 100);
  const done = stats.completed === stats.total;

  return (
    <div className="glow-card p-6">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-[var(--accent)]" />
        <h2 className="text-lg font-semibold text-text-primary">
          Twój postęp
        </h2>
      </div>
      <p className="mb-2 text-sm text-text-secondary">
        Ukończono {stats.completed} z {stats.total} lekcji ({pct}%)
      </p>
      <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            done
              ? "bg-green-400 shadow-[0_0_14px_rgba(74,222,128,0.7)]"
              : "bg-[var(--accent)] shadow-[0_0_14px_var(--accent-glow)]"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Pasek postępu pojedynczego rozdziału (na karcie pulpitu). */
export function ChapterProgressBar({ chapterId }: { chapterId: string }) {
  const [stat, setStat] = useState<ChapterStat | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch("/api/progress/stats")
        .then((r) => (r.ok ? r.json() : null))
        .then((data: Stats | null) => {
          if (data && !cancelled) {
            setStat(
              data.chapters.find((c) => c.chapterId === chapterId) ?? null
            );
          }
        })
        .catch(() => {});
    load();
    window.addEventListener("progress:update", load);
    return () => {
      cancelled = true;
      window.removeEventListener("progress:update", load);
    };
  }, [chapterId]);

  if (!stat || stat.total === 0) return null;
  const pct = Math.round((stat.completed / stat.total) * 100);
  const done = stat.completed === stat.total;

  return (
    <div className="mt-3">
      <p className="mb-1 text-xs text-text-muted">
        {stat.completed}/{stat.total} ukończonych ({pct}%)
      </p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            done
              ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]"
              : "bg-[var(--accent)]"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
