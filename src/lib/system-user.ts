import { prisma } from "@/lib/prisma";

const SYSTEM_EMAIL = "system@platform.local";
export const SYSTEM_USERNAME = "SYSTEM";

/**
 * Zwraca id konta systemowego „SYSTEM" (tworzy je przy pierwszym użyciu).
 * Konto nie ma hasła, więc nie można się na nie zalogować — służy wyłącznie
 * do wysyłania wiadomości incognito przez administratora.
 */
export async function getSystemUserId(): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { email: SYSTEM_EMAIL },
    select: { id: true },
  });
  if (existing) return existing.id;
  const created = await prisma.user.create({
    data: { email: SYSTEM_EMAIL, username: SYSTEM_USERNAME, role: "STUDENT" },
    select: { id: true },
  });
  return created.id;
}
