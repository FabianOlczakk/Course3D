/**
 * Wspólny sekret do podpisu/weryfikacji tokenów sesji (HS256).
 *
 * Ten sam sekret jest używany w trzech miejscach, które MUSZĄ być spójne:
 *  - src/app/api/auth/login/route.ts (podpis tokenu przy logowaniu)
 *  - src/middleware.ts (weryfikacja przy każdym żądaniu)
 *  - src/lib/auth.ts (encode/decode w NextAuth)
 *
 * Brak sekretu = krytyczna luka (pusty klucz pozwala podrobić token admina),
 * dlatego zamiast cichego fallbacku na "" zgłaszamy błąd.
 */
const rawSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "";

if (!rawSecret || rawSecret.length < 32) {
  throw new Error(
    "AUTH_SECRET (lub NEXTAUTH_SECRET) jest wymagany i musi mieć co najmniej 32 znaki. " +
      "Wygeneruj go np. poleceniem: openssl rand -base64 32"
  );
}

/** Surowy sekret jako string. */
export const AUTH_SECRET = rawSecret;

/** Sekret zakodowany jako klucz dla biblioteki jose. */
export const SECRET_KEY = new TextEncoder().encode(rawSecret);
