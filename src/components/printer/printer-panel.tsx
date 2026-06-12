"use client";

import { Printer, X, ExternalLink } from "lucide-react";

// Wysuwany panel sterowania drukarką 3D (placeholder — funkcja wkrótce).
export function PrinterPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="glow-card animate-in slide-in-from-right relative z-10 flex h-full w-full max-w-[480px] flex-col rounded-none border-l border-[var(--border-glow)] duration-200">
        {/* Nagłówek */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
            <Printer className="h-5 w-5 text-[var(--accent)]" />
            Kontrola Drukarki 3D
          </h2>
          <button
            className="glow-icon-btn"
            aria-label="Zamknij"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Treść */}
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto p-8 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[var(--accent-glow)] shadow-glow">
            <Printer className="h-12 w-12 text-[var(--accent)]" />
          </div>

          <h3 className="text-xl font-bold text-text-primary">
            Bambu Lab A1 Mini
          </h3>

          <p className="text-base font-medium text-[var(--accent)]">
            Integracja z chmurą Bambu Lab wkrótce
          </p>

          <p className="max-w-xs text-sm text-text-secondary">
            Ta funkcja zostanie udostępniona po skonfigurowaniu drukarki
            dostarczonej z kursem. Będziesz mógł monitorować wydruki i sterować
            drukarką bezpośrednio z platformy.
          </p>

          <a
            href="https://github.com/bambulab"
            target="_blank"
            rel="noopener noreferrer"
            className="glow-btn mt-2 inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium text-white"
          >
            Dowiedz się więcej
            <ExternalLink className="h-4 w-4" />
          </a>

          <a
            href="https://github.com/bambulab/BambuStudio"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-text-muted underline hover:text-text-secondary"
          >
            GitHub: Bambu Lab Cloud API
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
