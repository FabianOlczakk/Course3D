-- Enums
DO $$ BEGIN
  CREATE TYPE "FormVisibility" AS ENUM ('ALL', 'ACTIVE', 'NEW');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "QuestionType" AS ENUM ('TEXT', 'TEXTAREA', 'NUMBER', 'CHECKBOX', 'RADIO');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "EmailCampaignStatus" AS ENUM ('DRAFT', 'SENDING', 'SENT', 'FAILED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "EmailRecipientType" AS ENUM ('ALL', 'NEWSLETTER', 'SPECIFIC');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Add newsletterConsent to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "newsletterConsent" BOOLEAN NOT NULL DEFAULT true;

-- Form table
CREATE TABLE IF NOT EXISTS "Form" (
  "id"          TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "title"       TEXT NOT NULL,
  "description" TEXT,
  "visibility"  "FormVisibility" NOT NULL DEFAULT 'ALL',
  "allowSkip"   BOOLEAN NOT NULL DEFAULT true,
  "active"      BOOLEAN NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- FormQuestion table
CREATE TABLE IF NOT EXISTS "FormQuestion" (
  "id"       TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "formId"   TEXT NOT NULL REFERENCES "Form"("id") ON DELETE CASCADE,
  "order"    INTEGER NOT NULL,
  "text"     TEXT NOT NULL,
  "type"     "QuestionType" NOT NULL,
  "options"  JSONB,
  "required" BOOLEAN NOT NULL DEFAULT false
);

-- FormResponse table
CREATE TABLE IF NOT EXISTS "FormResponse" (
  "id"        TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "formId"    TEXT NOT NULL REFERENCES "Form"("id") ON DELETE CASCADE,
  "userId"    TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "answers"   JSONB NOT NULL DEFAULT '{}',
  "skipped"   BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("formId", "userId")
);

-- EmailCampaign table
CREATE TABLE IF NOT EXISTS "EmailCampaign" (
  "id"             TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "subject"        TEXT NOT NULL,
  "content"        TEXT NOT NULL,
  "recipientType"  "EmailRecipientType" NOT NULL DEFAULT 'ALL',
  "specificEmails" JSONB,
  "status"         "EmailCampaignStatus" NOT NULL DEFAULT 'DRAFT',
  "sentAt"         TIMESTAMP(3),
  "recipientCount" INTEGER,
  "testSentTo"     TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdById"    TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS "FormResponse_formId_idx" ON "FormResponse"("formId");
CREATE INDEX IF NOT EXISTS "FormResponse_userId_idx" ON "FormResponse"("userId");
CREATE INDEX IF NOT EXISTS "EmailCampaign_createdById_idx" ON "EmailCampaign"("createdById");
CREATE INDEX IF NOT EXISTS "EmailCampaign_status_idx" ON "EmailCampaign"("status");
