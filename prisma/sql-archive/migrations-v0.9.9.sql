-- =====================================================================
-- Migracja v0.9.9 — prywatność aktywności + głosy na komentarze
-- (uruchom w edytorze SQL Supabase). Idempotentne — można puścić wiele razy.
-- =====================================================================

-- 1) Prywatność aktywności: gdy true, inni kursanci (poza adminami) nie widzą
--    statusu "aktywny teraz" / kropki online. Admini widzą zawsze.
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "activityPrivate" BOOLEAN NOT NULL DEFAULT FALSE;

-- 2) Głosy (like/dislike) na komentarzach — analogicznie do PostVote.
--    Enum "VoteValue" (UP/DOWN) już istnieje w bazie (utworzony przy PostVote).
CREATE TABLE IF NOT EXISTS "CommentVote" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "commentId" TEXT NOT NULL,
  "value"     "VoteValue" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CommentVote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CommentVote_userId_commentId_key"
  ON "CommentVote" ("userId", "commentId");

CREATE INDEX IF NOT EXISTS "CommentVote_commentId_idx"
  ON "CommentVote" ("commentId");

-- Klucze obce (idempotentne — dodaj tylko jeśli brak).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CommentVote_userId_fkey'
  ) THEN
    ALTER TABLE "CommentVote"
      ADD CONSTRAINT "CommentVote_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CommentVote_commentId_fkey'
  ) THEN
    ALTER TABLE "CommentVote"
      ADD CONSTRAINT "CommentVote_commentId_fkey"
      FOREIGN KEY ("commentId") REFERENCES "Comment" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
