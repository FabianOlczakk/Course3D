"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Printer,
  X,
  Loader2,
  Thermometer,
  Copy,
  Check,
  Camera,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/lib/toast";
import {
  printStatusLabel,
  type PrinterStatus,
  type BambulabDevice,
} from "@/lib/bambulab";

// SQL do utworzenia tabeli BambulabConnection (kopia z prisma/bambulab-migration.sql).
const MIGRATION_SQL = `CREATE TABLE "BambulabConnection" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT,
  "deviceList" JSONB,
  "selectedDeviceId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BambulabConnection_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "BambulabConnection_userId_key" ON "BambulabConnection"("userId");
ALTER TABLE "BambulabConnection" ADD CONSTRAINT "BambulabConnection_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`;

type View = "loading" | "missing_table" | "connect" | "select" | "dashboard";

export function PrinterPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [view, setView] = useState<View>("loading");
  const [devices, setDevices] = useState<BambulabDevice[]>([]);
  const [status, setStatus] = useState<PrinterStatus | null>(null);

  // Sprawdź stan połączenia po otwarciu panelu.
  const refresh = useCallback(async () => {
    setView("loading");
    try {
      const res = await fetch("/api/bambulab/devices");
      if (res.status === 503) {
        setView("missing_table");
        return;
      }
      if (res.status === 404) {
        // NOT_CONNECTED
        setView("connect");
        return;
      }
      if (!res.ok) {
        setView("connect");
        return;
      }
      const data = await res.json();
      setDevices(data.devices ?? []);
      if (data.selectedDeviceId) {
        setView("dashboard");
      } else {
        setView("select");
      }
    } catch {
      setView("connect");
    }
  }, []);

  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="glow-card animate-in slide-in-from-right relative z-10 flex h-full w-full max-w-[480px] flex-col rounded-none border-l border-[var(--border-glow)] duration-200">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
            <Printer className="h-5 w-5 text-[var(--accent)]" />
            Kontrola Drukarki 3D
          </h2>
          <button className="glow-icon-btn" aria-label="Zamknij" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {view === "loading" && (
            <div className="flex justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-text-muted" />
            </div>
          )}
          {view === "missing_table" && <MissingTable />}
          {view === "connect" && <ConnectForm onConnected={refresh} />}
          {view === "select" && (
            <DeviceSelect devices={devices} onSelected={refresh} />
          )}
          {view === "dashboard" && (
            <Dashboard
              status={status}
              setStatus={setStatus}
              onDisconnect={refresh}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function MissingTable() {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(MIGRATION_SQL);
      setCopied(true);
      toast.success("SQL skopiowany do schowka.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Nie udało się skopiować.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        <p className="text-sm text-amber-200">
          Uruchom migrację SQL w edytorze SQL Supabase, aby aktywować tę
          funkcję.
        </p>
      </div>
      <pre className="max-h-64 overflow-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] p-3 text-xs text-text-secondary">
        {MIGRATION_SQL}
      </pre>
      <button
        type="button"
        onClick={copy}
        className="glow-btn inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Skopiowano" : "Kopiuj SQL"}
      </button>
    </div>
  );
}

function ConnectForm({ onConnected }: { onConnected: () => void }) {
  const toast = useToast();
  const [tab, setTab] = useState<"credentials" | "token">("credentials");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  // Krok 2FA
  const [tfaKey, setTfaKey] = useState<string | null>(null);
  const [code, setCode] = useState("");

  const inputCls = "w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)] px-3 py-2 text-sm text-text-primary outline-none focus:border-[var(--border-glow)]";

  const handleError = (data: Record<string, unknown>, status: number) => {
    if (status === 503 || data.error === "MISSING_TABLE") {
      toast.error("Tabela nie istnieje — uruchom migrację SQL.");
      onConnected();
      return true;
    }
    return false;
  };

  const submitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bambulab/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "credentials", account, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (handleError(data, res.status)) return;
      if (data.requiresCode) {
        setTfaKey(data.tfaKey ?? "");
        toast.success("Kod weryfikacyjny wysłany na Twój email.");
        return;
      }
      if (!res.ok) { toast.error(data.error ?? "Błąd połączenia."); return; }
      toast.success("Połączono z BambuLab.");
      setPassword("");
      onConnected();
    } catch { toast.error("Błąd połączenia."); }
    finally { setLoading(false); }
  };

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bambulab/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "verify", tfaKey, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (handleError(data, res.status)) return;
      if (!res.ok) { toast.error(data.error ?? "Nieprawidłowy kod."); return; }
      toast.success("Połączono z BambuLab.");
      onConnected();
    } catch { toast.error("Błąd połączenia."); }
    finally { setLoading(false); }
  };

  const submitToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bambulab/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "token", accessToken: token.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (handleError(data, res.status)) return;
      if (!res.ok) { toast.error(data.error ?? "Błąd."); return; }
      toast.success("Połączono z BambuLab.");
      setToken("");
      onConnected();
    } catch { toast.error("Błąd połączenia."); }
    finally { setLoading(false); }
  };

  // Krok 2: wpisz kod weryfikacyjny z maila
  if (tfaKey !== null) {
    return (
      <form onSubmit={submitCode} className="space-y-4">
        <div className="flex flex-col items-center gap-2 py-2 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-glow)]">
            <Printer className="h-8 w-8 text-[var(--accent)]" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">Weryfikacja emailem</h3>
          <p className="text-sm text-text-secondary">BambuLab wysłał 6-cyfrowy kod na Twój email. Wpisz go poniżej.</p>
        </div>
        <div className="space-y-1">
          <label className="text-sm text-text-secondary">Kod weryfikacyjny</label>
          <input
            type="text"
            required
            maxLength={8}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className={`${inputCls} text-center text-2xl tracking-[0.5em] font-mono`}
            placeholder="000000"
            autoFocus
          />
        </div>
        <button type="submit" disabled={loading || code.length < 4}
          className="glow-btn inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Potwierdź kod
        </button>
        <button type="button" onClick={() => { setTfaKey(null); setCode(""); }}
          className="w-full text-center text-xs text-text-muted hover:text-text-secondary">
          ← Wróć
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-2 py-2 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-glow)]">
          <Printer className="h-8 w-8 text-[var(--accent)]" />
        </div>
        <h3 className="text-lg font-bold text-text-primary">Połącz drukarkę BambuLab</h3>
      </div>

      {/* Zakładki */}
      <div className="flex rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] p-1 text-sm">
        {(["credentials", "token"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-3 py-1.5 transition-colors ${tab === t ? "bg-[var(--accent)] text-white" : "text-text-secondary hover:text-text-primary"}`}>
            {t === "credentials" ? "Email i hasło" : "Token JWT"}
          </button>
        ))}
      </div>

      {tab === "credentials" ? (
        <form onSubmit={submitCredentials} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm text-text-secondary">Email BambuLab</label>
            <input type="email" required value={account} onChange={(e) => setAccount(e.target.value)} className={inputCls} placeholder="email@example.com" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-text-secondary">Hasło</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" />
          </div>
          <p className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] p-3 text-xs text-text-muted">
            ⚠️ Hasło nie jest przechowywane. BambuLab może wysłać kod 2FA na Twój email.
          </p>
          <button type="submit" disabled={loading}
            className="glow-btn inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Połącz
          </button>
        </form>
      ) : (
        <form onSubmit={submitToken} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm text-text-secondary">Token JWT</label>
            <textarea required rows={3} value={token} onChange={(e) => setToken(e.target.value)}
              className={`${inputCls} resize-none font-mono text-xs`}
              placeholder="eyJhbGciOiJSUzI1NiJ9..." />
          </div>
          <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-300 space-y-2">
            <p className="font-semibold">📋 Jak znaleźć token JWT BambuLab?</p>
            <ol className="list-decimal list-inside space-y-1.5 text-blue-200">
              <li>Zaloguj się na <strong>bambulab.com</strong> przez Google</li>
              <li>Naciśnij <strong>F12</strong> (DevTools) → zakładka <strong>Network</strong></li>
              <li>Odśwież stronę (F5)</li>
              <li>W liście zapytań kliknij dowolne do <code className="bg-blue-900/40 px-1 rounded">api.bambulab.com</code></li>
              <li>Otwórz zakładkę <strong>Headers</strong> → znajdź <strong>Authorization</strong></li>
              <li>Skopiuj wszystko <strong>po słowie Bearer</strong> (zaczyna się od <code className="bg-blue-900/40 px-1 rounded">eyJ</code>)</li>
            </ol>
          </div>
          <button type="submit" disabled={loading || !token.trim().startsWith("eyJ")}
            className="glow-btn inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Połącz tokenem
          </button>
          {token && !token.trim().startsWith("eyJ") && (
            <p className="text-xs text-red-400">Token musi zaczynać się od &quot;eyJ&quot; — to nie jest prawidłowy token JWT.</p>
          )}
        </form>
      )}
    </div>
  );
}

function DeviceSelect({
  devices,
  onSelected,
}: {
  devices: BambulabDevice[];
  onSelected: () => void;
}) {
  const toast = useToast();
  const [selected, setSelected] = useState<string | null>(
    devices[0]?.dev_id ?? null
  );
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    if (!selected || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bambulab/select-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: selected }),
      });
      if (!res.ok) {
        toast.error("Nie udało się wybrać drukarki.");
        return;
      }
      onSelected();
    } catch {
      toast.error("Błąd połączenia.");
    } finally {
      setLoading(false);
    }
  };

  if (devices.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-text-muted">
        Brak drukarek na koncie BambuLab.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-text-primary">
        Wybierz drukarkę
      </h3>
      <div className="space-y-2">
        {devices.map((d) => (
          <label
            key={d.dev_id}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border-subtle)] p-3 transition-colors hover:border-[var(--border-glow)]"
          >
            <input
              type="radio"
              name="device"
              checked={selected === d.dev_id}
              onChange={() => setSelected(d.dev_id)}
              className="accent-[var(--accent)]"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text-primary">
                {d.name}
              </p>
              <p className="text-xs text-text-muted">
                {d.dev_product_name ?? d.dev_model_name ?? "Drukarka"} ·{" "}
                {d.online ? "Online" : "Offline"}
              </p>
            </div>
          </label>
        ))}
      </div>
      <button
        type="button"
        onClick={confirm}
        disabled={!selected || loading}
        className="glow-btn inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Wybierz
      </button>
    </div>
  );
}

function Dashboard({
  status,
  setStatus,
  onDisconnect,
}: {
  status: PrinterStatus | null;
  setStatus: (s: PrinterStatus | null) => void;
  onDisconnect: () => void;
}) {
  const toast = useToast();
  const [disconnecting, setDisconnecting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/bambulab/status");
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data.status ?? null);
    } catch {
      // pomijamy błędy pojedynczego odpytania
    }
  }, [setStatus]);

  // Odpytywanie statusu co 10 sekund, gdy panel otwarty.
  useEffect(() => {
    void poll();
    timerRef.current = setInterval(() => void poll(), 10000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [poll]);

  const disconnect = async () => {
    if (disconnecting) return;
    setDisconnecting(true);
    try {
      const res = await fetch("/api/bambulab/connect", { method: "DELETE" });
      if (!res.ok) {
        toast.error("Nie udało się rozłączyć.");
        return;
      }
      toast.success("Rozłączono drukarkę.");
      onDisconnect();
    } catch {
      toast.error("Błąd połączenia.");
    } finally {
      setDisconnecting(false);
    }
  };

  const isPrinting =
    status?.printStatus?.toUpperCase() === "RUNNING";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text-primary">
          {status?.deviceName ?? "Drukarka BambuLab"}
        </h3>
        <button
          type="button"
          onClick={disconnect}
          disabled={disconnecting}
          aria-label="Rozłącz"
          className="glow-icon-btn"
        >
          {disconnecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-text-secondary">Status:</span>
        <span
          className={`inline-flex items-center gap-1.5 font-medium ${
            isPrinting ? "text-green-400" : "text-text-primary"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isPrinting ? "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]" : "bg-text-muted"
            }`}
          />
          {status ? printStatusLabel(status.printStatus) : "—"}
        </span>
      </div>

      {status?.fileName && (
        <div className="text-sm">
          <span className="text-text-secondary">Plik: </span>
          <span className="text-text-primary">{status.fileName}</span>
        </div>
      )}

      {status?.progressPercent != null && (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Postęp</span>
            <span className="font-medium text-text-primary">
              {Math.round(status.progressPercent)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-base)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent-glow)] transition-all"
              style={{ width: `${Math.min(100, Math.max(0, status.progressPercent))}%` }}
            />
          </div>
        </div>
      )}

      {status?.remainingMinutes != null && (
        <div className="text-sm">
          <span className="text-text-secondary">Pozostały czas: </span>
          <span className="text-text-primary">
            {status.remainingMinutes} min
          </span>
        </div>
      )}

      <div className="space-y-2 border-t border-[var(--border-subtle)] pt-4">
        <h4 className="text-sm font-semibold text-text-primary">Temperatury</h4>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Thermometer className="h-4 w-4 text-[var(--accent)]" />
          Dysza: {fmtTemp(status?.nozzleTemp)} / {fmtTemp(status?.nozzleTarget)}
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Thermometer className="h-4 w-4 text-[var(--accent)]" />
          Stół: {fmtTemp(status?.bedTemp)} / {fmtTemp(status?.bedTarget)}
        </div>
      </div>

      <div className="space-y-2 border-t border-[var(--border-subtle)] pt-4">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <Camera className="h-4 w-4 text-[var(--accent)]" />
          Kamera
        </h4>
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--bg-base)] p-4 text-center text-xs text-text-muted">
          Podgląd niedostępny — otwórz aplikację Bambu Handy
        </div>
      </div>

      <div className="flex gap-2 border-t border-[var(--border-subtle)] pt-4">
        <button
          type="button"
          disabled
          title="Sterowanie wkrótce"
          className="flex-1 rounded-md border border-[var(--border-subtle)] px-3 py-2 text-sm text-text-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          Wstrzymaj
        </button>
        <button
          type="button"
          disabled
          title="Sterowanie wkrótce"
          className="flex-1 rounded-md border border-[var(--border-subtle)] px-3 py-2 text-sm text-text-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          Zatrzymaj
        </button>
      </div>
    </div>
  );
}

function fmtTemp(v: number | null | undefined): string {
  return v == null ? "—" : `${Math.round(v)}°C`;
}
