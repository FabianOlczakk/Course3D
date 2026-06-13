-- Migracja: tabela połączeń BambuLab.
-- Uruchom w edytorze SQL Supabase, aby aktywować integrację z drukarką BambuLab.

CREATE TABLE "BambulabConnection" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT,
  "deviceList" JSONB,
  "selectedDeviceId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BambulabConnection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BambulabConnection_userId_key" ON "BambulabConnection"("userId");

ALTER TABLE "BambulabConnection" ADD CONSTRAINT "BambulabConnection_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
