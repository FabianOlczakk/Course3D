import { prisma } from "@/lib/prisma";

const SYSTEM_EMAIL = "system@platform.local";
export const SYSTEM_USERNAME = "SYSTEM";

/**
 * Zwraca id konta systemowego „SYSTEM" (tworzy je przy pierwszym użyciu).
 * Konto nie ma hasła — służy wyłącznie do incognito-wiadomości administratora.
 */
export async function getSystemUserId(): Promise<string> {
  // Szukaj po emailu lub nazwie użytkownika (zabezpieczenie po ręcznym resecie tabeli).
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: SYSTEM_EMAIL }, { username: SYSTEM_USERNAME }] },
    select: { id: true },
  });
  if (existing) return existing.id;

  try {
    const created = await prisma.user.create({
      data: { email: SYSTEM_EMAIL, username: SYSTEM_USERNAME, role: "STUDENT" },
      select: { id: true },
    });
    return created.id;
  } catch {
    // Wyścig między dwoma równoczesnymi żądaniami — znajdź istniejący rekord.
    const fallback = await prisma.user.findFirst({
      where: { OR: [{ email: SYSTEM_EMAIL }, { username: SYSTEM_USERNAME }] },
      select: { id: true },
    });
    if (fallback) return fallback.id;
    throw new Error("Nie można utworzyć ani znaleźć konta SYSTEM.");
  }
}
