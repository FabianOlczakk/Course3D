"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Loader2,
  RefreshCw,
  Rocket,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  Circle,
} from "lucide-react";

type Source = "app" | "pm2out" | "pm2err" | "deploy";

const SOURCES: { key: Source; label: string }[] = [
  { key: "app", label: "Logi aplikacji" },
  { key: "deploy", label: "Logi deployu" },
  { key: "pm2out", label: "PM2 stdout" },
  { key: "pm2err", label: "PM2 stderr" },
];

function lineColor(line: string) {
  if (/\[ERROR\]/.test(line)) return "text-red-400";
  if (/\[WARN\]/.test(line)) return "text-yellow-400";
  if (/FAILED/.test(line)) return "text-red-400";
  if (/SUCCESS/.test(line)) return "text-green-400";
  if (/DEPLOY START/.test(line) || /DEPLOY/.test(line)) return "text-[var(--accent-soft)]";
  return "text-[var(--text-secondary)]";
}

export function DeveloperClient() {
  const [source, setSource] = useState<Source>("app");
  const [lines, setLines] = useState<string[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployMsg, setDeployMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLogs = useCallback(async (src: Source = source) => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/admin/logs?source=${src}`);
      if (res.ok) {
        const data = await res.json();
        setLines(data.lines ?? []);
      }
    } finally {
      setLoadingLogs(false);
    }
  }, [source]);

  useEffect(() => {
    void fetchLogs(source);
  }, [source, fetchLogs]);

  // Auto-scroll do dołu przy nowych wpisach
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  // Auto-refresh co 5 sekund
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => void fetchLogs(), 5000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, fetchLogs]);

  // Podczas deployu przełącz na logi deployu i włącz auto-refresh
  async function handleDeploy() {
    if (!confirm("Uruchomić deploy z najnowszego commita na main? Aplikacja zrestartuje się po zakończeniu.")) return;
    setDeploying(true);
    setDeployMsg(null);
    try {
      const res = await fetch("/api/admin/deploy", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setDeployMsg({ ok: true, text: data.message });
        setSource("deploy");
        setAutoRefresh(true);
      } else {
        setDeployMsg({ ok: false, text: data.error ?? "Błąd deployu." });
      }
    } catch {
      setDeployMsg({ ok: false, text: "Błąd połączenia." });
    } finally {
      setDeploying(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-[26px] md:px-[30px]">
      {/* Nagłówek */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Terminal className="h-5 w-5 text-[var(--accent)]" />
          <h1 className="font-display text-[20px] font-semibold text-[var(--text-primary)]">
            Deweloper
          </h1>
        </div>

        {/* Deploy */}
        <button
          type="button"
          onClick={() => void handleDeploy()}
          disabled={deploying}
          className="inline-flex items-center gap-2 rounded-[8px] bg-[var(--accent)] px-4 py-2 text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {deploying ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Rocket className="h-4 w-4" />
          )}
          Deploy z main
        </button>
      </div>

      {/* Komunikat po deployu */}
      {deployMsg && (
        <div
          className={`flex items-start gap-2 rounded-[8px] border px-4 py-3 text-sm ${
            deployMsg.ok
              ? "border-green-500/30 bg-green-500/10 text-green-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {deployMsg.ok ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          {deployMsg.text}
        </div>
      )}

      {/* Przeglądarka logów */}
      <div className="glow-card overflow-hidden">
        {/* Górny pasek — zakładki + kontrolki */}
        <div className="flex flex-wrap items-center gap-1 border-b border-[var(--border-subtle)] px-3 py-2">
          {SOURCES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSource(s.key)}
              className={`rounded-[6px] px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                source === s.key
                  ? "bg-[var(--accent-glow)] text-[var(--accent-soft)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {s.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            {/* Wskaźnik auto-refresh */}
            <button
              type="button"
              onClick={() => setAutoRefresh((v) => !v)}
              title={autoRefresh ? "Wyłącz auto-odświeżanie" : "Włącz auto-odświeżanie"}
              className={`flex items-center gap-1.5 rounded-[6px] px-2.5 py-1.5 text-[11.5px] font-semibold transition-colors ${
                autoRefresh
                  ? "bg-green-500/10 text-green-400"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <Circle
                className="h-2 w-2"
                fill={autoRefresh ? "currentColor" : "none"}
              />
              Live
            </button>
            <button
              type="button"
              onClick={() => void fetchLogs()}
              disabled={loadingLogs}
              className="rounded-[6px] p-1.5 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] disabled:opacity-50"
              title="Odśwież logi"
            >
              <RefreshCw className={`h-4 w-4 ${loadingLogs ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Terminal */}
        <div className="h-[60vh] overflow-y-auto bg-[#0d0d0d] p-4 font-mono text-[12px] leading-relaxed">
          {lines.length === 0 ? (
            <p className="text-[var(--text-muted)]">
              {loadingLogs ? "Wczytywanie…" : "Brak wpisów w tym źródle logów."}
            </p>
          ) : (
            lines.map((l, i) => (
              <div key={i} className={`whitespace-pre-wrap break-all ${lineColor(l)}`}>
                {l}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Stopka */}
        <div className="flex items-center gap-3 border-t border-[var(--border-subtle)] px-4 py-2 text-[11px] text-[var(--text-muted)]">
          <span>{lines.length} linii</span>
          {autoRefresh && (
            <span className="text-green-400">● odświeżanie co 5 s</span>
          )}
        </div>
      </div>

    </div>
  );
}
