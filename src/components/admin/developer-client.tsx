"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { APP_VERSION } from "@/lib/version";
import {
  AlertTriangle,
  Bug,
  Check,
  CheckCircle2,
  Circle,
  HelpCircle,
  Loader2,
  Plus,
  RefreshCw,
  Rocket,
  Terminal,
  X,
} from "lucide-react";

type Source = "app" | "pm2out" | "pm2err" | "deploy";
type Tab = "logs" | "tickets";

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

interface TicketUser {
  id: string;
  username: string | null;
  email: string;
  avatarUrl: string | null;
}
interface Ticket {
  id: string;
  type: "HELP" | "BUG" | "FEATURE" | "OTHER";
  message: string;
  pageUrl: string;
  resolved: boolean;
  createdAt: string;
  user: TicketUser;
}

function TicketsPanel() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("open");
  const [creating, setCreating] = useState(false);
  const [newType, setNewType] = useState<"HELP" | "BUG" | "FEATURE" | "OTHER">("BUG");
  const [newMessage, setNewMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/support-tickets");
      if (res.ok) setTickets((await res.json()).tickets ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadTickets(); }, [loadTickets]);

  async function toggleResolved(t: Ticket) {
    const res = await fetch(`/api/admin/support-tickets?id=${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolved: !t.resolved }),
    });
    if (res.ok) {
      const data = await res.json();
      setTickets((prev) => prev.map((x) => x.id === t.id ? data.ticket : x));
    }
  }

  async function createTicket() {
    if (!newMessage.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: newType, message: newMessage.trim(), pageUrl: "admin" }),
      });
      if (res.ok) {
        const data = await res.json();
        setTickets((prev) => [data.ticket, ...prev]);
        setNewMessage("");
        setCreating(false);
      }
    } finally { setSubmitting(false); }
  }

  const shown = tickets.filter((t) =>
    filter === "all" ? true : filter === "open" ? !t.resolved : t.resolved
  );

  return (
    <div className="glow-card overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border-subtle)] px-4 py-3">
        <div className="flex gap-1">
          {(["open", "resolved", "all"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-[6px] px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                filter === f
                  ? "bg-[var(--accent-glow)] text-[var(--accent-soft)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {f === "open" ? "Otwarte" : f === "resolved" ? "Zamknięte" : "Wszystkie"}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadTickets()}
            disabled={loading}
            className="rounded-[6px] p-1.5 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] disabled:opacity-50"
            title="Odśwież"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => setCreating((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-[6px] bg-[var(--accent-glow)] px-3 py-1.5 text-[12px] font-semibold text-[var(--accent-soft)] transition-colors hover:bg-[var(--accent)]/20"
          >
            <Plus className="h-3.5 w-3.5" /> Nowe zgłoszenie
          </button>
        </div>
      </div>

      {/* New ticket form */}
      {creating && (
        <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3 space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setNewType("BUG")}
              className={`flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-[12px] font-semibold transition-colors ${newType === "BUG" ? "bg-red-500/20 text-red-400" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}
            >
              <Bug className="h-3.5 w-3.5" /> Błąd
            </button>
            <button
              type="button"
              onClick={() => setNewType("HELP")}
              className={`flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-[12px] font-semibold transition-colors ${newType === "HELP" ? "bg-blue-500/20 text-blue-400" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}
            >
              <HelpCircle className="h-3.5 w-3.5" /> Pomoc
            </button>
            <button
              type="button"
              onClick={() => setNewType("FEATURE")}
              className={`flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-[12px] font-semibold transition-colors ${newType === "FEATURE" ? "bg-green-500/20 text-green-400" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}
            >
              <Plus className="h-3.5 w-3.5" /> Nowa funkcja
            </button>
            <button
              type="button"
              onClick={() => setNewType("OTHER")}
              className={`flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-[12px] font-semibold transition-colors ${newType === "OTHER" ? "bg-[var(--text-muted)]/20 text-[var(--text-secondary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}
            >
              <Circle className="h-3.5 w-3.5" /> Inne
            </button>
          </div>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Opis zgłoszenia..."
            rows={3}
            className="w-full resize-none rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setCreating(false)} className="rounded-md px-3 py-1.5 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
              Anuluj
            </button>
            <button
              type="button"
              onClick={() => void createTicket()}
              disabled={submitting || !newMessage.trim()}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Utwórz
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="divide-y divide-[var(--border-subtle)]">
        {loading && shown.length === 0 && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--text-muted)]" />
          </div>
        )}
        {!loading && shown.length === 0 && (
          <p className="py-8 text-center text-sm text-[var(--text-muted)]">Brak zgłoszeń.</p>
        )}
        {shown.map((t) => (
          <div key={t.id} className={`px-4 py-3 ${t.resolved ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-start gap-2">
              <span className={`mt-0.5 shrink-0 rounded-[4px] px-2 py-0.5 text-[10px] font-semibold ${t.type === "BUG" ? "bg-red-500/15 text-red-400" : t.type === "FEATURE" ? "bg-green-500/15 text-green-400" : t.type === "OTHER" ? "bg-[var(--text-muted)]/15 text-[var(--text-secondary)]" : "bg-blue-500/15 text-blue-400"}`}>
                {t.type === "BUG" ? "Błąd" : t.type === "FEATURE" ? "Nowa funkcja" : t.type === "OTHER" ? "Inne" : "Pomoc"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-wrap break-words text-[13px] text-[var(--text-primary)]">{t.message}</p>
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                  {t.user.username ?? t.user.email} · {t.pageUrl} · {new Date(t.createdAt).toLocaleString("pl-PL")}
                </p>
              </div>
              <button
                type="button"
                title={t.resolved ? "Otwórz ponownie" : "Zamknij"}
                onClick={() => void toggleResolved(t)}
                className={`shrink-0 rounded-[6px] p-1.5 transition-colors ${
                  t.resolved
                    ? "text-[var(--text-muted)] hover:text-green-400"
                    : "text-green-400 hover:text-[var(--text-muted)]"
                }`}
              >
                {t.resolved ? <X className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DeveloperClient() {
  const [tab, setTab] = useState<Tab>("logs");
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
      if (res.ok) setLines((await res.json()).lines ?? []);
    } finally { setLoadingLogs(false); }
  }, [source]);

  useEffect(() => { void fetchLogs(source); }, [source, fetchLogs]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines]);
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => void fetchLogs(), 5000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, fetchLogs]);

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
          <h1 className="font-display text-[20px] font-semibold text-[var(--text-primary)]">Deweloper</h1>
        </div>
        <button
          type="button"
          onClick={() => void handleDeploy()}
          disabled={deploying}
          className="inline-flex items-center gap-2 rounded-[8px] bg-[var(--accent)] px-4 py-2 text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {deploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
          Deploy z main
        </button>
      </div>

      {deployMsg && (
        <div className={`flex items-start gap-2 rounded-[8px] border px-4 py-3 text-sm ${deployMsg.ok ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-red-500/30 bg-red-500/10 text-red-400"}`}>
          {deployMsg.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
          {deployMsg.text}
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-[var(--border-subtle)]">
        {([["logs", "Logi"], ["tickets", "Zgłoszenia"]] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-t-[6px] px-4 py-2 text-[13px] font-semibold transition-colors ${
              tab === key
                ? "border-b-2 border-[var(--accent)] text-[var(--accent-soft)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "logs" && (
        <div className="glow-card overflow-hidden">
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
              <button
                type="button"
                onClick={() => setAutoRefresh((v) => !v)}
                className={`flex items-center gap-1.5 rounded-[6px] px-2.5 py-1.5 text-[11.5px] font-semibold transition-colors ${
                  autoRefresh ? "bg-green-500/10 text-green-400" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                <Circle className="h-2 w-2" fill={autoRefresh ? "currentColor" : "none"} />
                Live
              </button>
              <button
                type="button"
                onClick={() => void fetchLogs()}
                disabled={loadingLogs}
                className="rounded-[6px] p-1.5 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loadingLogs ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
          <div className="h-[60vh] overflow-y-auto bg-[#0d0d0d] p-4 font-mono text-[12px] leading-relaxed">
            {lines.length === 0 ? (
              <p className="text-[var(--text-muted)]">{loadingLogs ? "Wczytywanie…" : "Brak wpisów."}</p>
            ) : (
              lines.map((l, i) => (
                <div key={i} className={`whitespace-pre-wrap break-all ${lineColor(l)}`}>{l}</div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
          <div className="flex items-center gap-3 border-t border-[var(--border-subtle)] px-4 py-2 text-[11px] text-[var(--text-muted)]">
            <span>{lines.length} linii</span>
            {autoRefresh && <span className="text-green-400">● odświeżanie co 5 s</span>}
          </div>
        </div>
      )}

      {tab === "tickets" && <TicketsPanel />}
    </div>
  );
}
