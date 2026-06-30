"use client";

import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { HelpCircle, X, Send, Loader2, CheckCircle2, Bug, LifeBuoy } from "lucide-react";

type TicketType = "HELP" | "BUG";

const TYPES: { key: TicketType; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    key: "HELP",
    label: "Pytanie / pomoc",
    icon: <LifeBuoy className="h-4 w-4" />,
    desc: "Potrzebuję pomocy lub mam pytanie",
  },
  {
    key: "BUG",
    label: "Błąd strony",
    icon: <Bug className="h-4 w-4" />,
    desc: "Coś nie działa lub wygląda źle",
  },
];

export function HelpWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TicketType>("HELP");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function openWidget() {
    setOpen(true);
    setSent(false);
    setError(null);
    setMessage("");
    setType("HELP");
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  function close() {
    setOpen(false);
  }

  async function submit() {
    const text = message.trim();
    if (!text) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message: text, pageUrl: pathname }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Błąd wysyłania. Spróbuj ponownie.");
        return;
      }
      setSent(true);
      setMessage("");
    } catch {
      setError("Błąd połączenia. Spróbuj ponownie.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        aria-label="Pomoc"
        onClick={open ? close : openWidget}
        className={`fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-all ${
          open
            ? "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            : "bg-[var(--accent)] text-white hover:opacity-90"
        }`}
      >
        {open ? <X className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-[340px] overflow-hidden rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
            <span className="font-display text-[14px] font-semibold text-[var(--text-primary)]">
              Pomoc &amp; zgłoszenia
            </span>
            <button
              type="button"
              aria-label="Zamknij"
              onClick={close}
              className="rounded-md p-1 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {sent ? (
            /* Potwierdzenie */
            <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-400" />
              <p className="font-semibold text-[var(--text-primary)]">Zgłoszenie wysłane!</p>
              <p className="text-[13px] text-[var(--text-muted)]">
                Dziękujemy. Instruktor zapozna się z Twoim zgłoszeniem.
              </p>
              <button
                type="button"
                onClick={() => { setSent(false); setMessage(""); }}
                className="mt-1 rounded-[6px] bg-[var(--accent-glow)] px-4 py-2 text-[13px] font-semibold text-[var(--accent-soft)] hover:bg-[var(--accent-glow)]"
              >
                Wyślij kolejne
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {/* Wybór typu */}
              <div className="grid grid-cols-2 gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setType(t.key)}
                    className={`flex flex-col items-start gap-1 rounded-[8px] border p-3 text-left transition-colors ${
                      type === t.key
                        ? "border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent-soft)]"
                        : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--accent)]/50"
                    }`}
                  >
                    <span className={type === t.key ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}>
                      {t.icon}
                    </span>
                    <span className="text-[12.5px] font-semibold leading-tight">{t.label}</span>
                    <span className="text-[11px] leading-tight opacity-70">{t.desc}</span>
                  </button>
                ))}
              </div>

              {/* Strona */}
              <div className="rounded-[6px] bg-[var(--bg-elevated)] px-3 py-2 text-[11.5px] text-[var(--text-muted)]">
                Strona: <span className="text-[var(--text-secondary)]">{pathname}</span>
              </div>

              {/* Treść */}
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder={
                  type === "BUG"
                    ? "Opisz co nie działa i kiedy to się pojawia..."
                    : "Napisz swoje pytanie lub czego potrzebujesz..."
                }
                className="w-full resize-none rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
              />

              {error && (
                <p className="text-[12px] text-red-400">{error}</p>
              )}

              <button
                type="button"
                disabled={sending || !message.trim()}
                onClick={() => void submit()}
                className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-[var(--accent)] py-2.5 text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Wyślij zgłoszenie
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
