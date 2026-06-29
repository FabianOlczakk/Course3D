"use client";

import { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrivacyFormProps {
  initialProgressPrivate: boolean;
}

export function PrivacyForm({ initialProgressPrivate }: PrivacyFormProps) {
  const [progressPrivate, setProgressPrivate] = useState(initialProgressPrivate);
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
        body: JSON.stringify({ progressPrivate }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nie udało się zapisać ustawień.");
        return;
      }
      setSuccess("Ustawienia prywatności zostały zaktualizowane.");
    } catch {
      setError("Wystąpił błąd. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="glow-card space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Prywatność</h2>
        <p className="text-sm text-text-secondary">
          Zarządzaj widocznością swoich statystyk nauki.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setProgressPrivate((v) => !v)}
        className="flex w-full items-center gap-4 rounded-lg border border-[var(--border-subtle)] p-4 text-left transition-colors hover:border-[var(--border-glow)]"
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md transition-colors ${
            progressPrivate
              ? "bg-[var(--accent)]/20 text-[var(--accent)]"
              : "bg-[var(--bg-elevated)] text-text-muted"
          }`}
        >
          {progressPrivate ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium text-text-primary">
            Ukryj postęp nauki
          </p>
          <p className="text-sm text-text-muted">
            {progressPrivate
              ? "Inne osoby nie widzą Twoich statystyk (passa, pozycja, ukończone lekcje)."
              : "Twój postęp jest widoczny publicznie na profilu."}
          </p>
        </div>
        <div
          className={`h-5 w-9 rounded-full transition-colors ${
            progressPrivate ? "bg-[var(--accent)]" : "bg-[#2e2e2e]"
          } relative`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              progressPrivate ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </div>
      </button>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-400">{success}</p>}

      <Button type="submit" disabled={loading} className="glow-btn text-white">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Zapisz ustawienia
      </Button>
    </form>
  );
}
