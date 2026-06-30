"use client";

import Link from "next/link";
import type { MentionMap } from "@/components/community/types";

// Dzieli treść na segmenty: znaczniki @[uid:ID], surowe @nazwa oraz zwykły tekst.
const SPLIT_RE = /(@\[uid:[\w-]+\]|@[\w.]+)/g;
const MARKER_RE = /^@\[uid:([\w-]+)\]$/;
const PLAIN_RE = /^@[\w.]+$/;

// Renderuje treść posta/komentarza z klikalnymi wzmiankami.
// Nazwy wzmiankowanych użytkowników pochodzą z `mentions` (na żywo z bazy),
// więc po zmianie nazwy aktualizują się także w starych treściach.
export function MentionText({
  content,
  mentions,
}: {
  content: string;
  mentions?: MentionMap;
}) {
  const parts = content.split(SPLIT_RE);
  return (
    <>
      {parts.map((part, i) => {
        const marker = part.match(MARKER_RE);
        if (marker) {
          const user = mentions?.[marker[1]];
          if (!user) {
            return (
              <span key={i} className="font-medium text-[var(--text-muted)]">
                @użytkownik
              </span>
            );
          }
          const label = user.username || user.email;
          return (
            <Link
              key={i}
              href={`/profil/${user.id}`}
              className="font-medium text-[var(--accent)] hover:underline"
            >
              @{label}
            </Link>
          );
        }
        if (PLAIN_RE.test(part)) {
          // Surowa wzmianka, której nie udało się powiązać z użytkownikiem.
          return (
            <span key={i} className="font-medium text-[var(--text-muted)]">
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
