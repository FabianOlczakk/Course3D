"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, MessageSquare, AtSign, Reply, Loader2 } from "lucide-react";
import { timeAgo } from "@/lib/format-time";

interface Actor {
  id: string;
  username: string | null;
  email: string;
  avatarUrl: string | null;
}

interface NotifItem {
  id: string;
  type: string;
  read: boolean;
  createdAt: string;
  actor: Actor;
  post: { id: string; title: string | null; content: string } | null;
  comment: { id: string; postId: string; content: string } | null;
}

function notifLabel(n: NotifItem): string {
  const actor = n.actor.username ?? n.actor.email;
  switch (n.type) {
    case "MENTION_POST":    return `${actor} oznaczył(a) Cię w poście`;
    case "MENTION_COMMENT": return `${actor} oznaczył(a) Cię w komentarzu`;
    case "REPLY_POST":      return `${actor} skomentował(a) Twój post`;
    case "REPLY_COMMENT":   return `${actor} odpowiedział(a) na Twój komentarz`;
    case "NEW_MESSAGE":     return `${actor} wysłał(a) Ci wiadomość`;
    default:                return `Nowe powiadomienie od ${actor}`;
  }
}

function notifUrl(n: NotifItem): string {
  if (n.type === "NEW_MESSAGE") return `/wiadomosci?u=${n.actor.id}`;
  const postId = n.comment?.postId ?? n.post?.id;
  if (postId) return `/spolecznosc/${postId}`;
  return "/spolecznosc";
}

function notifIcon(type: string) {
  if (type === "NEW_MESSAGE")     return <MessageSquare className="h-4 w-4 text-[var(--accent)]" />;
  if (type.startsWith("MENTION")) return <AtSign className="h-4 w-4 text-orange-400" />;
  return <Reply className="h-4 w-4 text-green-400" />;
}

function actorInitials(a: Actor) {
  return (a.username ?? a.email).slice(0, 2).toUpperCase();
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifs(data.notifications ?? []);
        setUnreadMessages(data.unreadMessages ?? 0);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch { /* ignore */ }
  }, []);

  // Poll every 30s
  useEffect(() => {
    void fetch_();
    const id = setInterval(() => void fetch_(), 30000);
    return () => clearInterval(id);
  }, [fetch_]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function openPanel() {
    setOpen((o) => !o);
    if (!open) {
      setLoading(true);
      await fetch_();
      setLoading(false);
    }
  }

  async function markAllRead() {
    await fetch("/api/notifications/read", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(unreadMessages); // only message unread remains
  }

  async function handleClick(n: NotifItem) {
    if (!n.read) {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [n.id] }),
      });
      setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    router.push(notifUrl(n));
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Powiadomienia"
        onClick={() => void openPanel()}
        className="glow-icon-btn relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[340px] overflow-hidden rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
            <span className="font-display text-[13.5px] font-semibold text-[var(--text-primary)]">
              Powiadomienia
            </span>
            {notifs.some((n) => !n.read) && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-[11.5px] text-[var(--accent-soft)] hover:underline"
              >
                Oznacz wszystkie
              </button>
            )}
          </div>

          {/* Unread messages row */}
          {unreadMessages > 0 && (
            <button
              type="button"
              onClick={() => { setOpen(false); router.push("/wiadomosci"); }}
              className="flex w-full items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--accent-glow)] px-4 py-2.5 text-left hover:bg-[var(--bg-elevated)]"
            >
              <MessageSquare className="h-4 w-4 shrink-0 text-[var(--accent)]" />
              <span className="flex-1 text-[12.5px] text-[var(--text-secondary)]">
                {unreadMessages} nieprzeczytanych wiadomości
              </span>
            </button>
          )}

          {/* Notification list */}
          <div className="max-h-[360px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--text-muted)]" />
              </div>
            ) : notifs.length === 0 ? (
              <p className="px-4 py-8 text-center text-[13px] text-[var(--text-muted)]">
                Brak powiadomień.
              </p>
            ) : (
              notifs.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => void handleClick(n)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--bg-elevated)] ${
                    !n.read ? "bg-[var(--accent-glow)]" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {n.actor.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={n.actor.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-semibold text-white">
                        {actorInitials(n.actor)}
                      </span>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-[var(--bg-card)] p-[2px]">
                      {notifIcon(n.type)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className={`text-[12.5px] leading-snug ${!n.read ? "font-semibold text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                      {notifLabel(n)}
                    </p>
                    {(n.post?.title ?? n.post?.content ?? n.comment?.content) && (
                      <p className="mt-0.5 line-clamp-1 text-[11.5px] text-[var(--text-muted)]">
                        {n.post?.title ?? (n.post?.content ?? n.comment?.content ?? "").slice(0, 60)}
                      </p>
                    )}
                    <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>

                  {!n.read && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
