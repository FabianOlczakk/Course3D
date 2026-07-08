-- =====================================================================
-- Migracja: poprawne tabele zamiast hacków (uruchom w edytorze SQL Supabase)
-- =====================================================================
-- Dodaje:
--   1. enum CategoryType + tabelę Category (kategorie tworzone przez admina)
--   2. Post.categoryId (kategoria postu)
--   3. tabelę Announcement (ogłoszenia jako pełnoprawna encja)
--   4. migrację istniejących ogłoszeń (Post z markerem) -> Announcement
--
-- Skrypt jest idempotentny — można go uruchomić wielokrotnie bezpiecznie.
-- =====================================================================

-- 1. Typ kategorii ----------------------------------------------------
DO $$ BEGIN
  CREATE TYPE "CategoryType" AS ENUM ('POST', 'ANNOUNCEMENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Tabela kategorii -------------------------------------------------
CREATE TABLE IF NOT EXISTS "Category" (
  "id"        TEXT PRIMARY KEY,
  "name"      TEXT NOT NULL,
  "color"     TEXT,
  "type"      "CategoryType" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "Category_type_name_key"
  ON "Category" ("type", "name");

-- 3. Post.categoryId --------------------------------------------------
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
DO $$ BEGIN
  ALTER TABLE "Post"
    ADD CONSTRAINT "Post_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4. Tabela ogłoszeń --------------------------------------------------
CREATE TABLE IF NOT EXISTS "Announcement" (
  "id"         TEXT PRIMARY KEY,
  "title"      TEXT NOT NULL,
  "content"    TEXT NOT NULL,
  "authorId"   TEXT NOT NULL,
  "categoryId" TEXT,
  "pinned"     BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
DO $$ BEGIN
  ALTER TABLE "Announcement"
    ADD CONSTRAINT "Announcement_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Announcement"
    ADD CONSTRAINT "Announcement_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "Announcement_pinned_createdAt_idx"
  ON "Announcement" ("pinned", "createdAt");

-- 5. Migracja istniejących ogłoszeń (Post z markerem) -> Announcement --
INSERT INTO "Announcement" ("id", "title", "content", "authorId", "createdAt", "updatedAt")
SELECT
  "id",
  COALESCE("title", 'Ogłoszenie'),
  "content",
  "authorId",
  "createdAt",
  "updatedAt"
FROM "Post"
WHERE "attachments" @> '[{"type":"SYSTEM_ANNOUNCEMENT"}]'::jsonb
ON CONFLICT ("id") DO NOTHING;

-- Usuń przeniesione posty-ogłoszenia ze społeczności
DELETE FROM "Post"
WHERE "attachments" @> '[{"type":"SYSTEM_ANNOUNCEMENT"}]'::jsonb;

-- =====================================================================
-- Gotowe. Po uruchomieniu zdeployuj aplikację (kod używa już tych tabel).
-- =====================================================================
