import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, FileText, Globe, Lock, Users } from "lucide-react";

export const dynamic = "force-dynamic";

function VisBadge({ v }: { v: string }) {
  if (v === "PUBLIC") return (
    <span className="inline-flex items-center gap-1 rounded-[4px] bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-green-500">
      <Globe className="h-2.5 w-2.5" /> Publiczna
    </span>
  );
  if (v === "USERS") return (
    <span className="inline-flex items-center gap-1 rounded-[4px] bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
      <Users className="h-2.5 w-2.5" /> Kursanci
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-[4px] bg-[var(--accent-glow)] px-2 py-0.5 text-[10px] font-semibold text-[var(--accent-soft)]">
      <Lock className="h-2.5 w-2.5" /> Admin
    </span>
  );
}

export default async function StronyPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  const visibilities = role === "ADMIN"
    ? ["PUBLIC", "USERS", "ADMIN"]
    : role === "STUDENT"
      ? ["PUBLIC", "USERS"]
      : ["PUBLIC"];

  const pages = await prisma.page.findMany({
    where: { visibility: { in: visibilities as ("PUBLIC" | "USERS" | "ADMIN")[] } },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true, description: true, visibility: true, createdAt: true },
  });

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <ArrowLeft className="h-4 w-4" />
            Strona główna
          </Link>
          {session?.user && (
            <Link href="/dashboard" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              Platforma →
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8 flex items-center gap-3">
          <FileText className="h-5 w-5 text-[var(--accent)]" />
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Strony</h1>
        </div>

        {pages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <FileText className="h-10 w-10 opacity-40" style={{ color: "var(--text-muted)" }} />
            <p style={{ color: "var(--text-muted)" }}>Brak dostępnych stron.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pages.map((page) => (
              <Link
                key={page.id}
                href={`/strony/${page.slug}`}
                className="flex items-start gap-4 rounded-xl border p-5 transition-all hover:shadow-sm"
                style={{ borderColor: "var(--border-subtle)", background: "var(--bg-card)" }}
              >
                <FileText className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--accent)" }} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{page.title}</span>
                    {role === "ADMIN" && <VisBadge v={page.visibility} />}
                  </div>
                  {page.description && (
                    <p className="mt-1 text-sm line-clamp-2" style={{ color: "var(--text-secondary)" }}>{page.description}</p>
                  )}
                  <p className="mt-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {new Date(page.createdAt).toLocaleDateString("pl-PL")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
