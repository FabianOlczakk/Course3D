"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowLeft, Loader2, Paperclip, Search, Send, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AttachmentView } from "@/components/shared/attachment-view";
import { AdminBadge } from "@/components/shared/admin-badge";
import { readAttachments, formatFileSize, type Attachment } from "@/lib/attachments-client";
import { shortTime, timeAgo } from "@/lib/format-time";
import { cn } from "@/lib/utils";

// Panel wiadomości prywatnych (wysuwany z prawej strony).
// Odświeżanie przez polling co 3 s (fetch). WebSocket/Socket.io można dodać później.

interface UserMini {
  id: string;
  username: string | null;
  email: string;
  avatarUrl: string | null;
  role?: string;
}

interface Conversation {
  userId: string;
  username: string | null;
  email: string;
  avatarUrl: string | null;
  role?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface MessageItem {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  attachments: Attachment[] | null;
  readAt: string | null;
  createdAt: string;
  sender: UserMini;
}

function displayName(u: { username: string | null; email: string }) {
  return u.username || u.email;
}

function initials(u: { username: string | null; email: string }) {
  return (u.username || u.email).slice(0, 2).toUpperCase();
}

export function MessagesPanel({
  open,
  onClose,
  initialUser,
}: {
  open: boolean;
  onClose: () => void;
  initialUser?: UserMini | null;
}) {
  const { data: session } = useSession();
  const meId = session?.user?.id ?? "";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<UserMini | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<UserMini[]>([]);
  const [draft, setDraft] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/messages/conversations");
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch {
      /* ignore polling errors */
    }
  }, []);

  const loadMessages = useCallback(
    async (userId: string) => {
      try {
        const res = await fetch(`/api/messages/${userId}`);
        if (!res.ok) return;
        const data = await res.json();
        setMessages(data.messages ?? []);
        // Oznacz jako przeczytane.
        await fetch(`/api/messages/${userId}/read`, { method: "POST" });
        void loadConversations();
      } catch {
        /* ignore */
      }
    },
    [loadConversations]
  );

  // Polling co 3 s aktywnej rozmowy + listy konwersacji.
  useEffect(() => {
    if (!open) return;
    void loadConversations();
    const id = setInterval(() => {
      void loadConversations();
      if (active) void loadMessages(active.id);
    }, 3000);
    return () => clearInterval(id);
  }, [open, active, loadConversations, loadMessages]);

  // Otwórz rozmowę.
  useEffect(() => {
    if (active) void loadMessages(active.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  // Gdy panel otwierany jest z wskazanym użytkownikiem (np. z profilu).
  useEffect(() => {
    if (open && initialUser) setActive(initialUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialUser?.id]);

  // Wyszukiwanie użytkowników (debounce).
  useEffect(() => {
    const q = search.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) return;
        const data = await res.json();
        setSearchResults(data.users ?? []);
      } catch {
        /* ignore */
      }
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // Auto-scroll na dół przy nowych wiadomościach.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length, active?.id]);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    try {
      const next = await readAttachments(files, pendingAttachments.length);
      setPendingAttachments((prev) => [...prev, ...next]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Błąd wczytywania pliku.");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSend() {
    if (!active) return;
    const content = draft.trim();
    if (!content && pendingAttachments.length === 0) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/messages/${active.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, attachments: pendingAttachments }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Nie udało się wysłać wiadomości.");
        return;
      }
      setDraft("");
      setPendingAttachments([]);
      await loadMessages(active.id);
    } catch {
      setError("Nie udało się wysłać wiadomości.");
    } finally {
      setSending(false);
    }
  }

  function startConversation(u: UserMini) {
    setActive(u);
    setSearch("");
    setSearchResults([]);
  }

  if (!open) return null;

  const showList = !active; // sterowanie widokiem na mobile

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="glow-card animate-in slide-in-from-right relative z-10 flex h-full w-full max-w-[600px] flex-col rounded-none border-l border-[var(--border-glow)] duration-200 md:m-0">
        {/* Nagłówek */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-4">
          <div className="flex items-center gap-2">
            {active && (
              <button
                className="glow-icon-btn md:hidden"
                aria-label="Wstecz"
                onClick={() => setActive(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-text-primary">
              💬 Wiadomości
            </h2>
          </div>
          <button className="glow-icon-btn" aria-label="Zamknij" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Lista konwersacji */}
          <div
            className={cn(
              "flex w-full flex-col border-r border-[var(--border-subtle)] md:w-[240px] md:shrink-0",
              !showList && "hidden md:flex"
            )}
          >
            <div className="border-b border-[var(--border-subtle)] p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Szukaj użytkownika..."
                  className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {search.trim() ? (
                searchResults.length ? (
                  searchResults.map((u) => (
                    <ConversationRow
                      key={u.id}
                      name={displayName(u)}
                      initials={initials(u)}
                      avatarUrl={u.avatarUrl}
                      preview={u.email}
                      onClick={() => startConversation(u)}
                    />
                  ))
                ) : (
                  <p className="p-4 text-center text-sm text-text-muted">
                    Brak wyników.
                  </p>
                )
              ) : conversations.length ? (
                conversations.map((c) => (
                  <ConversationRow
                    key={c.userId}
                    name={displayName(c)}
                    initials={initials(c)}
                    avatarUrl={c.avatarUrl}
                    preview={c.lastMessage}
                    time={timeAgo(c.lastMessageAt)}
                    unread={c.unreadCount}
                    activeRow={active?.id === c.userId}
                    onClick={() =>
                      startConversation({
                        id: c.userId,
                        username: c.username,
                        email: c.email,
                        avatarUrl: c.avatarUrl,
                        role: c.role,
                      })
                    }
                  />
                ))
              ) : (
                <p className="p-4 text-center text-sm text-text-muted">
                  Brak konwersacji. Wyszukaj użytkownika, aby rozpocząć.
                </p>
              )}
            </div>
          </div>

          {/* Aktywna konwersacja */}
          <div
            className={cn(
              "flex min-w-0 flex-1 flex-col",
              showList && "hidden md:flex"
            )}
          >
            {active ? (
              <>
                <div className="flex shrink-0 items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3">
                  <Avatar className="h-8 w-8">
                    {active.avatarUrl && (
                      <AvatarImage src={active.avatarUrl} alt={displayName(active)} />
                    )}
                    <AvatarFallback className="text-xs">
                      {initials(active)}
                    </AvatarFallback>
                  </Avatar>
                  <a
                    href={`/profil/${active.id}`}
                    className="font-medium text-text-primary hover:text-[var(--accent)] hover:underline"
                  >
                    {displayName(active)}
                  </a>
                  <AdminBadge role={active.role} />
                </div>

                <div
                  ref={scrollRef}
                  className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4"
                >
                  {messages.length === 0 && (
                    <p className="py-8 text-center text-sm text-text-muted">
                      Brak wiadomości. Napisz pierwszą!
                    </p>
                  )}
                  {messages.map((m) => {
                    const mine = m.senderId === meId;
                    return (
                      <div
                        key={m.id}
                        className={cn("flex", mine ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                            mine
                              ? "glow-btn rounded-br-sm text-white"
                              : "rounded-bl-sm border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-text-primary"
                          )}
                        >
                          {m.content && (
                            <p className="whitespace-pre-wrap break-words">
                              {m.content}
                            </p>
                          )}
                          {m.attachments && (
                            <AttachmentView attachments={m.attachments} />
                          )}
                          <span
                            className={cn(
                              "mt-1 block text-[10px]",
                              mine ? "text-white/70" : "text-text-muted"
                            )}
                          >
                            {shortTime(m.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pasek wprowadzania */}
                <div className="shrink-0 border-t border-[var(--border-subtle)] p-3">
                  {error && (
                    <p className="mb-2 text-xs text-red-400">{error}</p>
                  )}
                  {pendingAttachments.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {pendingAttachments.map((a, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-1 text-xs text-text-secondary"
                        >
                          {a.name} ({formatFileSize(a.size)})
                          <button
                            type="button"
                            aria-label="Usuń załącznik"
                            onClick={() =>
                              setPendingAttachments((prev) =>
                                prev.filter((_, idx) => idx !== i)
                              )
                            }
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-end gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFiles(e.target.files)}
                    />
                    <button
                      type="button"
                      className="glow-icon-btn shrink-0"
                      aria-label="Dodaj załącznik"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void handleSend();
                        }
                      }}
                      rows={1}
                      placeholder="Napisz..."
                      className="max-h-32 min-h-[2.25rem] flex-1 resize-none rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      type="button"
                      className="glow-icon-btn shrink-0 disabled:opacity-50"
                      aria-label="Wyślij"
                      disabled={sending}
                      onClick={() => void handleSend()}
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                <p className="text-text-secondary">
                  Wybierz konwersację lub wyszukaj użytkownika.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversationRow({
  name,
  initials: ini,
  avatarUrl,
  preview,
  time,
  unread,
  activeRow,
  onClick,
}: {
  name: string;
  initials: string;
  avatarUrl: string | null;
  preview: string;
  time?: string;
  unread?: number;
  activeRow?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 border-b border-[var(--border-subtle)] px-3 py-3 text-left transition-colors hover:bg-[var(--bg-elevated)]",
        activeRow && "bg-[var(--bg-elevated)]"
      )}
    >
      <Avatar className="h-9 w-9 shrink-0">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
        <AvatarFallback className="text-xs">{ini}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-text-primary">
            {name}
          </span>
          {time && (
            <span className="shrink-0 text-[10px] text-text-muted">{time}</span>
          )}
        </div>
        <span className="block truncate text-xs text-text-secondary">
          {preview}
        </span>
      </div>
      {!!unread && unread > 0 && (
        <span className="flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-[var(--accent)] px-1.5 text-[10px] font-semibold text-white">
          {unread}
        </span>
      )}
    </button>
  );
}
