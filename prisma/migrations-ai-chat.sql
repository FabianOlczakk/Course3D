-- =====================================================================
-- Migracja: pula tokenów AI dla użytkowników (funkcja "AI" — chatbot kursu)
-- (uruchom w edytorze SQL Supabase, lub użyj `npm run db:push`). Idempotentne.
-- =====================================================================

-- Liczba pozostałych tokenów AI dla użytkownika. Ustawiana przez admina
-- w /admin/users. Po wyczerpaniu (<= 0) użytkownik nie może wysyłać
-- nowych wiadomości do asystenta AI.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "aiTokens" INTEGER NOT NULL DEFAULT 50000;
