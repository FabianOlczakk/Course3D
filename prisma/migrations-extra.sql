-- =====================================================================
-- Migracja: dodatkowy opis lekcji + prywatność postępu użytkownika
-- (uruchom w edytorze SQL Supabase). Idempotentne.
-- =====================================================================

-- Dodatkowy opis lekcji (pod wideo, pod przyciskami)
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "extraDescription" TEXT;

-- Prywatność postępu: gdy true, inni (poza adminami) nie widzą postępu
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "progressPrivate" BOOLEAN NOT NULL DEFAULT FALSE;
