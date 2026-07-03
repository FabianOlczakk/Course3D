import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DeveloperClient } from "@/components/admin/developer-client";
import { APP_VERSION } from "@/lib/version";

export const metadata: Metadata = { title: "Deweloper — Interaktywny Kurs Druku 3D" };

export default async function DeveloperPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-xl font-semibold text-[var(--text-primary)]">Deweloper</h1>
        <span className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-muted)]">
          v{APP_VERSION}
        </span>
      </div>
      <DeveloperClient />
    </div>
  );
}
