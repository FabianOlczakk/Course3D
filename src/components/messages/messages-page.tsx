"use client";

import { MessagesPanel } from "@/components/messages/messages-panel";

interface UserMini {
  id: string;
  username: string | null;
  email: string;
  avatarUrl: string | null;
  role?: string;
}

/** Pełnoekranowy widok wiadomości (trasa /wiadomosci). */
export function MessagesPageView({ initialUser }: { initialUser?: UserMini | null }) {
  return (
    <MessagesPanel
      open
      variant="page"
      onClose={() => {}}
      initialUser={initialUser}
    />
  );
}
