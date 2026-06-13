"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AttachmentView } from "@/components/shared/attachment-view";
import type { Attachment } from "@/lib/attachments-client";
import { shortTime } from "@/lib/format-time";
import { cn } from "@/lib/utils";

interface UserMini {
  id: string;
  username: string | null;
  email: string;
  avatarUrl: string | null;
  role: string;
}

interface MessageItem {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  attachments: Attachment[] | null;
  createdAt: string;
  sender: UserMini;
  receiver: UserMini;
}

function name(u: UserMini) {
  return u.username || u.email;
}

// Read-only podgląd wszystkich konwersacji użytkownika dla admina.
export function AdminUserMessages({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOther, setActiveOther] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}/messages`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setMessages(data.messages ?? []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Grupowanie po drugim rozmówcy.
  const conversations = useMemo(() => {
    const map = new Map<string, { other: UserMini; last: MessageItem }>();
    for (const m of messages) {
      const other = m.senderId === userId ? m.receiver : m.sender;
      map.set(other.id, { other, last: m });
    }
    return Array.from(map.values());
  }, [messages, userId]);

  const activeMessages = useMemo(
    () =>
      activeOther
        ? messages.filter(
            (m) => m.senderId === activeOther || m.receiverId === activeOther
          )
        : [],
    [messages, activeOther]
  );

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ten użytkownik nie ma żadnych wiadomości.
      </p>
    );
  }

  return (
    <div className="glow-card flex h-[70vh] overflow-hidden">
      <div className="w-64 shrink-0 overflow-y-auto border-r border-[var(--border-subtle)]">
        {conversations.map(({ other, last }) => (
          <button
            key={other.id}
            type="button"
            onClick={() => setActiveOther(other.id)}
            className={cn(
              "flex w-full items-center gap-3 border-b border-[var(--border-subtle)] p-3 text-left transition-colors hover:bg-[var(--bg-elevated)]",
              activeOther === other.id && "bg-[var(--bg-elevated)]"
            )}
          >
            <Avatar className="h-8 w-8">
              {other.avatarUrl && <AvatarImage src={other.avatarUrl} />}
              <AvatarFallback className="text-xs">
                {name(other).slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">
                {name(other)}
              </p>
              <p className="truncate text-xs text-text-muted">{last.content}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="min-w-0 flex-1 space-y-2 overflow-y-auto p-4">
        {!activeOther ? (
          <p className="py-8 text-center text-sm text-text-muted">
            Wybierz konwersację, aby zobaczyć wiadomości.
          </p>
        ) : (
          activeMessages.map((m) => {
            const fromTarget = m.senderId === userId;
            return (
              <div
                key={m.id}
                className={cn("flex", fromTarget ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                    fromTarget
                      ? "bg-[var(--accent)]/20 text-text-primary"
                      : "border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-text-primary"
                  )}
                >
                  <p className="mb-1 text-[10px] text-text-muted">
                    {name(m.sender)}
                  </p>
                  {m.content && (
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  )}
                  {m.attachments && <AttachmentView attachments={m.attachments} />}
                  <span className="mt-1 block text-[10px] text-text-muted">
                    {shortTime(m.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
