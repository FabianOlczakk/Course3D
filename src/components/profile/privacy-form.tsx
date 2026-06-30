"use client";

import { useState } from "react";
import { Loader2, Eye, EyeOff, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrivacyFormProps {
  initialProgressPrivate: boolean;
  initialActivityPrivate: boolean;
}

export function PrivacyForm({ initialProgressPrivate, initialActivityPrivate }: PrivacyFormProps) {
  const [progressPrivate, setProgressPrivate] = useState(initialProgressPrivate);
  const [activityPrivate, setActivityPrivate] = useState(initialActivityPrivate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progressPrivate, activityPrivate }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Nie udało się zapisać."); return; }
      setSuccess("Ustawienia prywatności zostały zaktualizowane.");
    } catch {
      setError("Wystąpił błąd. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  function Toggle({ value, onChange, icon, title, description }: {
    value: boolean; onChange: (v: boolean) => void;
    icon: React.ReactNode; title: string; description: string;
  }) {
    return (
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="flex w-full items-center gap-4 rounded-lg border border-[var(--border-subtle)] p-4 text-left transition-colors hover:border-[var(--border-glow)]"
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md transition-colors ${value ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "bg-[var(--bg-elevated)] text-text-muted"}`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="font-medium text-text-primary">{title}</p>
          <p className="text-sm text-text-muted">{description}</p>
        </div>
        <div className={`h-5 w-9 rounded-full transition-colors ${value ? "bg-[var(--accent)]" : "bg-[#2e2e2e]"} relative`}>
          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-4" : "translate-x-0.5"}`} />
        </div>
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glow-card space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Prywatność</h2>
        <p className="text-sm text-text-secondary">Zarządzaj widocznością swoich danych.</p>
      </div>

      <div className="space-y-3">
        <Toggle
          value={progressPrivate}
          onChange={setProgressPrivate}
          icon={progressPrivate ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          title="Ukryj postęp nauki"
          description={progressPrivate
            ? "Inne osoby nie widzą Twoich statystyk (passa, pozycja, ukończone lekcje)."
            : "Twój postęp jest widoczny publicznie na profilu."}
        />
        <Toggle
          value={activityPrivate}
          onChange={setActivityPrivate}
          icon={<Activity className="h-5 w-5" />}
          title="Ukryj status aktywności"
          description={activityPrivate
            ? "Inni kursanci nie widzą czy jesteś online. Administratorzy zawsze widzą status."
            : "Twój status aktywności (Aktywny teraz) jest widoczny dla innych kursantów."}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-400">{success}</p>}

      <Button type="submit" disabled={loading} className="glow-btn text-white">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Zapisz ustawienia
      </Button>
    </form>
  );
}
