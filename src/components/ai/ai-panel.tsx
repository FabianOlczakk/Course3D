"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, Send, Loader2, BookOpen, MessageSquare, FileText, X, Plus, History, Trash2 } from "lucide-react";
import { Markdown } from "@/components/shared/markdown";
import { useAiPanel } from "@/components/ai/ai-panel-context";

type Role = "user" | "assistant";

interface Citation {
  type: "wiki" | "lesson" | "post";
  title: string;
  url: string;
  category?: string | null;
  chapterTitle?: string | null;
  tag?: string | null;
  author?: string | null;
  createdAt?: string | null;
}

interface ChatMessage {
  role: Role;
  content: string;
  citations?: Citation[];
}

interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
}

const CITATION_ICON = { wiki: BookOpen, lesson: FileText, post: MessageSquare } as const;
const CITATION_LABEL = { wiki: "Wiki", lesson: "Lekcja", post: "Społeczność" } as const;

export function AiPanel() {
  const { open, close } = useAiPanel();
  const pathname = usePathname();

  const [tokensRemaining, setTokensRemaining] = useState<number | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingConv, setLoadingConv] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Ładowanie tokenów + listy rozmów przy pierwszym otwarciu panelu
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const [convRes, tokensRes] = await Promise.all([
          fetch("/api/ai/conversations"),
          fetch("/api/ai/tokens"),
        ]);
        if (convRes.ok) {
          const d = await convRes.json();
          setConversations(d.conversations ?? []);
        }
        if (tokensRes.ok) {
          const d = await tokensRes.json();
          setTokensRemaining(d.tokensRemaining ?? 0);
        }
      } catch {
        /* ignore */
      }
    })();
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const outOfTokens = tokensRemaining !== null && tokensRemaining <= 0;

  async function openConversation(id: string) {
    setLoadingConv(true);
    setShowHistory(false);
    setError(null);
    try {
      const res = await fetch(`/api/ai/conversations/${id}`);
      if (!res.ok) return;
      const d = await res.json();
      setConversationId(d.conversation.id);
      setMessages(
        d.conversation.messages.map((m: { role: Role; content: string; citations: Citation[] | null }) => ({
          role: m.role,
          content: m.content,
          citations: m.citations ?? undefined,
        }))
      );
    } finally {
      setLoadingConv(false);
    }
  }

  function startNewChat() {
    setConversationId(null);
    setMessages([]);
    setError(null);
    setShowHistory(false);
  }

  async function deleteConversation(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Usunąć tę rozmowę?")) return;
    await fetch(`/api/ai/conversations/${id}`, { method: "DELETE" });
    setConversations((c) => c.filter((x) => x.id !== id));
    if (conversationId === id) startNewChat();
  }

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
        body: JSON.stringify({ conversationId, message: text, page: pathname }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nie udało się uzyskać odpowiedzi.");
        setMessages(messages);
        setInput(text);
        return;
      }
      setConversationId(data.conversationId);
      setTokensRemaining(data.tokensRemaining ?? 0);
      setMessages((cur) => [...cur, { role: "assistant", content: data.message, citations: data.citations ?? [] }]);
      setConversations((cur) => {
        const exists = cur.some((c) => c.id === data.conversationId);
        if (exists) {
          return cur.map((c) => (c.id === data.conversationId ? { ...c, updatedAt: new Date().toISOString() } : c));
        }
        return [{ id: data.conversationId, title: text.slice(0, 60), updatedAt: new Date().toISOString() }, ...cur];
      });
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

  if (!open) return null;

  return (
    <aside className="flex h-full w-[380px] shrink-0 flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-card)]">
      {/* Header */}
      <div className="flex h-14 items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-4">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-[18px] w-[18px] shrink-0 text-[var(--accent)]" />
          <span className="font-display text-[14px] font-semibold text-[var(--text-primary)] truncate">Asystent AI</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {tokensRemaining !== null && (
            <span
              className={`hidden sm:inline-block rounded-md border px-1.5 py-0.5 font-mono text-[10px] ${
                outOfTokens
                  ? "border-red-500/30 bg-red-500/10 text-red-400"
                  : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)]"
              }`}
            >
              {tokensRemaining.toLocaleString("pl")}
            </span>
          )}
          <button onClick={startNewChat} title="Nowy czat" className="glow-icon-btn">
            <Plus className="h-4 w-4" />
          </button>
          <button onClick={() => setShowHistory((s) => !s)} title="Historia rozmów" className="glow-icon-btn">
            <History className="h-4 w-4" />
          </button>
          <button onClick={close} title="Zamknij" className="glow-icon-btn">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showHistory ? (
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <p className="p-3 text-sm text-[var(--text-muted)]">Brak zapisanych rozmów.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => void openConversation(c.id)}
                className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  conversationId === c.id ? "bg-[var(--accent-glow)] text-[var(--accent-soft)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                }`}
              >
                <span className="min-w-0 truncate">{c.title}</span>
                <span onClick={(e) => void deleteConversation(c.id, e)} className="shrink-0 rounded p-1 text-[var(--text-muted)] hover:text-red-400">
                  <Trash2 className="h-3.5 w-3.5" />
                </span>
              </button>
            ))
          )}
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {loadingConv ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--text-muted)]" />
              </div>
            ) : messages.length === 0 ? (
              <div className="glow-card p-4 text-xs text-[var(--text-muted)]">
                Zapytaj o cokolwiek związane z drukiem 3D lub kursem. Jeśli jesteś na stronie lekcji lub artykułu
                Wiki, asystent widzi jej treść i może pomóc bezpośrednio z tym materiałem.
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[92%] rounded-xl px-3 py-2 text-sm ${
                      m.role === "user" ? "bg-[var(--accent)] text-white" : "glow-card text-[var(--text-primary)]"
                    }`}
                  >
                    {m.role === "assistant" ? <Markdown>{m.content}</Markdown> : <p className="whitespace-pre-wrap">{m.content}</p>}
                    {m.citations && m.citations.length > 0 && (
                      <div className="mt-2.5 space-y-1.5 border-t border-[var(--border-subtle)]/50 pt-2">
                        {m.citations.map((c) => {
                          const Icon = CITATION_ICON[c.type];
                          return (
                            <a
                              key={c.url}
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start gap-2 rounded-md bg-[var(--bg-elevated)] p-2 text-xs transition-colors hover:bg-[var(--border-subtle)]"
                            >
                              <Icon className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[var(--accent)]" />
                              <span className="min-w-0">
                                <span className="block font-medium text-[var(--text-primary)]">
                                  {CITATION_LABEL[c.type]}: {c.title}
                                </span>
                                {c.type === "wiki" && c.category && (
                                  <span className="text-[var(--text-muted)]">{c.category}</span>
                                )}
                                {c.type === "lesson" && c.chapterTitle && (
                                  <span className="text-[var(--text-muted)]">{c.chapterTitle}</span>
                                )}
                                {c.type === "post" && (
                                  <span className="text-[var(--text-muted)]">
                                    {[c.tag, c.author, c.createdAt ? new Date(c.createdAt).toLocaleDateString("pl") : null]
                                      .filter(Boolean)
                                      .join(" · ")}
                                  </span>
                                )}
                              </span>
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="flex justify-start">
                <div className="glow-card flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-muted)]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Szukam odpowiedzi...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {error && <p className="px-3 text-xs text-red-400">{error}</p>}

          {outOfTokens ? (
            <div className="m-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              Wyczerpano pulę tokenów AI. Skontaktuj się z administratorem.
            </div>
          ) : (
            <div className="flex items-end gap-2 p-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Napisz wiadomość..."
                rows={2}
                className="input flex-1 resize-none text-sm"
                disabled={sending}
              />
              <button
                onClick={() => void handleSend()}
                disabled={sending || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                title="Wyślij"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          )}
        </>
      )}
    </aside>
  );
}
