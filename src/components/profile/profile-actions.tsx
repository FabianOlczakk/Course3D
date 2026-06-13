"use client";

import Link from "next/link";
import { MessageSquare, Pencil } from "lucide-react";

interface ProfileUser {
  id: string;
  username: string | null;
  email: string;
  avatarUrl: string | null;
  role: string;
}

// Przyciski akcji na profilu: wyślij wiadomość, (admin) edytuj.
export function ProfileActions({
  user,
  viewerIsAdmin,
}: {
  user: ProfileUser;
  viewerIsAdmin: boolean;
}) {
  function sendMessage() {
    window.dispatchEvent(
      new CustomEvent("open-messages", {
        detail: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
          role: user.role,
        },
      })
    );
  }

  return (
    <div className="flex shrink-0 flex-col gap-2">
      <button
        type="button"
        onClick={sendMessage}
        className="glow-btn inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
      >
        <MessageSquare className="h-4 w-4" />
        Wyślij wiadomość
      </button>
      {viewerIsAdmin && (
        <Link
          href="/admin/users"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--border-subtle)] px-4 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          <Pencil className="h-4 w-4" />
          Edytuj użytkownika
        </Link>
      )}
    </div>
  );
}
