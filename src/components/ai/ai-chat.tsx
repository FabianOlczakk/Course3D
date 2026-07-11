"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, Send, Loader2, BookOpen, MessageSquare, FileText } from "lucide-react";

type Role = "user" | "assistant";

interface Citation {
  type: "wiki" | "lesson" | "post";
  title: string;
  url: string;
  excerpt: string;
}

interface ChatMessage {
  role: Role;
  content: string;
  citations?: Citation[];
}

const CITATION_ICON = { wiki: BookOpen, lesson: FileText, post: MessageSquare } as const;
const CITATION_LABEL = { wiki: "Wiki", lesson: "Lekcja", post: "Społeczność" } as const;

export function AiChat({ initialTokens }: { initialTokens: number }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokensRemaining, setTokensRemaining] = useState(initialTokens);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const outOfTokens = tokensRemaining <= 0;

  async function handleSend() {
    const text = input.trim();
    if (!text || sending || outOfTokens) return;
    setError(null);
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nie udało się uzyskać odpowiedzi.");
        setMessages(messages); // cofnij wysłaną wiadomość, żeby użytkownik mógł spróbować ponownie
        setInput(text);
        return;
      }
      setTokensRemaining(data.tokensRemaining ?? 0);
      setMessages((cur) => [...cur, { role: "assistant", content: data.message, citations: data.citations ?? [] }]);
    } catch {
      setError("Błąd połączenia. Spróbuj ponownie.");
      setMessages(messages);
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col p-4 md:p-6">
      <div className="flex items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-[var(--accent)]" />
          <h1 className="font-display text-[20px] font-semibold text-[var(--text-primary)]">Asystent AI</h1>
        </div>
        <span
          className={`rounded-md border px-2 py-0.5 font-mono text-[11px] ${
            outOfTokens
              ? "border-red-500/30 bg-red-500/10 text-red-400"
              : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)]"
          }`}
        >
          {tokensRemaining.toLocaleString("pl")} tokenów
        </span>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="glow-card p-6 text-sm text-[var(--text-muted)]">
            Zapytaj o cokolwiek związanego z drukiem 3D lub kursem — np. „Mój filament kruszy się i skwierczy podczas
            druku, co robić?”. Asystent poszuka odpowiedzi w Wiki, lekcjach i społeczności kursu.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === "user"
                ? "bg-[var(--accent)] text-white"
                : "glow-card text-[var(--text-primary)]"
            }`}>
              <p className="whitespace-pre-wrap">{m.content}</p>
              {m.citations && m.citations.length > 0 && (
                <div className="mt-3 space-y-1.5 border-t border-[var(--border-subtle)]/50 pt-2.5">
                  {m.citations.map((c) => {
                    const Icon = CITATION_ICON[c.type];
                    return (
                      <Link
                        key={c.url}
                        href={c.url}
                        className="flex items-start gap-2 rounded-md bg-[var(--bg-elevated)] p-2 text-xs transition-colors hover:bg-[var(--border-subtle)]"
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[var(--accent)]" />
                        <span className="min-w-0">
                          <span className="block font-medium text-[var(--text-primary)]">
                            {CITATION_LABEL[c.type]}: {c.title}
                          </span>
                          {c.excerpt && <span className="line-clamp-2 text-[var(--text-muted)]">{c.excerpt}</span>}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="glow-card flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-muted)]">
              <Loader2 className="h-4 w-4 animate-spin" /> Szukam odpowiedzi...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      {outOfTokens ? (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          Wyczerpano pulę tokenów AI. Skontaktuj się z administratorem, aby zwiększyć limit.
        </div>
      ) : (
        <div className="mt-4 flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Napisz wiadomość... (Enter aby wysłać, Shift+Enter nowa linia)"
            rows={2}
            className="input flex-1 resize-none"
            disabled={sending}
          />
          <button
            onClick={() => void handleSend()}
            disabled={sending || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            title="Wyślij"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
