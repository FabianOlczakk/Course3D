/**
 * Prosty rate-limiter w pamięci procesu (sliding window).
 *
 * Wystarczający dla pojedynczej instancji PM2/Node. Dla wielu instancji
 * lub serverless należałoby użyć współdzielonego magazynu (np. Redis /
 * Upstash Ratelimit).
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function take(
  key: string,
  limit: number,
  windowMs: number,
  now: number
): boolean {
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/** Okresowe czyszczenie wygasłych wpisów, by mapa nie rosła w nieskończoność. */
function cleanup(now: number) {
  if (buckets.size < 1000) return;
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}

/**
 * Limit prób logowania: domyślnie 10 prób / 5 minut na dany identyfikator
 * (zwykle adres IP). Zwraca false, gdy limit został przekroczony.
 */
export function checkLoginRateLimit(
  identifier: string,
  limit = 10,
  windowMs = 5 * 60 * 1000
): boolean {
  const now = Date.now();
  cleanup(now);
  return take(`login:${identifier}`, limit, windowMs, now);
}
