import { prisma } from "@/lib/prisma";

// System wzmianek (@użytkownik).
//
// Treść postów/komentarzy przechowujemy z trwałymi znacznikami `@[uid:ID]`
// zamiast surowego `@nazwa`. Dzięki temu:
//  - klik we wzmiankę prowadzi do profilu (znamy ID),
//  - zmiana nazwy użytkownika aktualizuje się we wszystkich starych postach
//    (nazwę odczytujemy na żywo z ID przy renderowaniu).
//
// Stare treści (zapisane jako `@nazwa`) są migrowane „leniwie" przy odczycie:
// jeśli `@nazwa` wciąż wskazuje istniejącego użytkownika, podmieniamy ją na
// znacznik i zapisujemy w tle.

// Surowa wzmianka wpisana przez użytkownika: @nazwa (litery, cyfry, _, .).
const PLAIN_RE = /@([\w.]+)/g;
// Trwały znacznik w bazie: @[uid:ID] — ID może być cuid lub UUID (z myślnikami)
const MARKER_RE = /@\[uid:([\w-]+)\]/g;

export interface MentionUser {
  id: string;
  username: string | null;
  email: string;
}

// Zamienia surowe `@nazwa` na znaczniki `@[uid:ID]` (tylko dla istniejących nazw).
// Wywoływane przy tworzeniu posta/komentarza.
export async function encodeMentions(content: string): Promise<string> {
  const names = [...new Set([...content.matchAll(PLAIN_RE)].map((m) => m[1]))];
  if (!names.length) return content;
  const users = await prisma.user.findMany({
    where: { username: { in: names } },
    select: { id: true, username: true },
  });
  if (!users.length) return content;
  const byName = new Map(users.map((u) => [u.username!, u.id]));
  return content.replace(PLAIN_RE, (full, name) =>
    byName.has(name) ? `@[uid:${byName.get(name)}]` : full
  );
}

type WithContent = { id: string; content: string };

/**
 * Dla listy elementów z treścią:
 *  1) migruje stare `@nazwa` → `@[uid:ID]` (i zapisuje w tle przez `persist`),
 *  2) zwraca elementy z treścią w formie znaczników,
 *  3) zwraca mapę ID → bieżący użytkownik (do renderowania nazw na żywo).
 */
export async function attachMentions<T extends WithContent>(
  items: T[],
  persist?: (id: string, content: string) => Promise<unknown>
): Promise<{ items: T[]; mentions: Record<string, MentionUser> }> {
  // 1) Migracja surowych nazw → znaczniki (jedno zapytanie zbiorcze).
  const plainNames = new Set<string>();
  for (const it of items) {
    for (const m of it.content.matchAll(PLAIN_RE)) plainNames.add(m[1]);
  }
  let byName = new Map<string, string>();
  if (plainNames.size) {
    const users = await prisma.user.findMany({
      where: { username: { in: [...plainNames] } },
      select: { id: true, username: true },
    });
    byName = new Map(users.map((u) => [u.username!, u.id]));
  }

  const migrated: T[] = items.map((it) => {
    if (!byName.size) return it;
    const next = it.content.replace(PLAIN_RE, (full, name) =>
      byName.has(name) ? `@[uid:${byName.get(name)}]` : full
    );
    if (next !== it.content) {
      // Zapis w tle — bez blokowania odpowiedzi.
      if (persist) void persist(it.id, next).catch(() => {});
      return { ...it, content: next };
    }
    return it;
  });

  // 2) Rozwiąż znaczniki ID → bieżący użytkownik (jedno zapytanie zbiorcze).
  const ids = new Set<string>();
  for (const it of migrated) {
    for (const m of it.content.matchAll(MARKER_RE)) ids.add(m[1]);
  }
  let mentions: Record<string, MentionUser> = {};
  if (ids.size) {
    const users = await prisma.user.findMany({
      where: { id: { in: [...ids] } },
      select: { id: true, username: true, email: true },
    });
    mentions = Object.fromEntries(users.map((u) => [u.id, u]));
  }

  return { items: migrated, mentions };
}
