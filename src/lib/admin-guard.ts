import { auth } from "@/lib/auth";

/**
 * Zwraca sesję jeśli zalogowany użytkownik jest administratorem,
 * w przeciwnym razie null. Używane w API route handlers.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}
