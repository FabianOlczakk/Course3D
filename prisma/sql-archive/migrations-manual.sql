-- Migracja: lastActiveAt dla statusu online użytkowników
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastActiveAt" TIMESTAMP(3);

-- Migracja: WikiArticle
CREATE TABLE IF NOT EXISTS "WikiArticle" (
  "id"        TEXT NOT NULL,
  "title"     TEXT NOT NULL,
  "slug"      TEXT NOT NULL,
  "content"   TEXT NOT NULL,
  "category"  TEXT,
  "authorId"  TEXT NOT NULL,
  "published" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WikiArticle_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "WikiArticle_slug_key" ON "WikiArticle"("slug");
ALTER TABLE "WikiArticle" ADD CONSTRAINT "WikiArticle_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
