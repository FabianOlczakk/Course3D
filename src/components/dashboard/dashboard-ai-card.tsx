"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import { useAiPanel } from "@/components/ai/ai-panel-context";

/** Karta na pulpicie zachęcająca do rozmowy z asystentem AI — otwiera prawy panel. */
export function DashboardAiCard() {
  const { toggle, open } = useAiPanel();

  const suggestions = [
    "Jak przechowywać filament?",
    "Mój wydruk się nie klei do stołu",
    "Co oznacza stringing?",
  ];

  return (
    <div className="glow-card relative overflow-hidden p-[16px_18px]">
      {/* Poświata akcentu w tle karty */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-40"
        style={{ background: "radial-gradient(circle, var(--accent-glow), transparent 70%)" }}
      />
      <div className="mb-[6px] flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[var(--accent)]" />
        <span className="font-display text-[14.5px] font-semibold text-[var(--text-primary)]">
          Asystent AI
        </span>
      </div>
      <p className="mb-3 text-[12.5px] text-[var(--text-muted)]">
        Masz pytanie o druk 3D? Asystent zna całą Wiki, lekcje i społeczność kursu.
      </p>
      <div className="mb-3 flex flex-col gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { if (!open) toggle(); }}
            className="truncate rounded-md border border-[var(--glass-border)] bg-[var(--bg-elevated)]/60 px-2.5 py-1.5 text-left text-[12px] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)]/50 hover:text-[var(--text-primary)]"
          >
            „{s}”
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => { if (!open) toggle(); }}
        className="glow-btn inline-flex w-full items-center justify-center gap-[7px] rounded-[8px] px-[15px] py-[8px] text-[12.5px] font-semibold text-white"
      >
        Otwórz czat
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
