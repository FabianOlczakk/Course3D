import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FileText, Lock, Users, Globe } from "lucide-react";

export const dynamic = "force-dynamic";

function VisibilityBadge({ v }: { v: string }) {
  if (v === "PUBLIC") return (
    <span className="inline-flex items-center gap-1 rounded-[4px] bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-green-400">
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
    <div className="mx-auto max-w-3xl space-y-6 p-6 md:p-8">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-[var(--accent)]" />
        <h1 className="font-display text-[22px] font-semibold text-[var(--text-primary)]">Strony</h1>
      </div>

      {pages.length === 0 ? (
        <div className="glow-card flex flex-col items-center gap-3 py-16 text-center">
          <FileText className="h-10 w-10 text-[var(--text-muted)] opacity-40" />
          <p className="text-[var(--text-muted)]">Brak dostępnych stron.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map((page) => (
            <Link
              key={page.id}
              href={`/strony/${page.slug}`}
              className="glow-card flex items-start gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--border-glow)]"
            >
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-[var(--text-primary)]">{page.title}</span>
                  <VisibilityBadge v={page.visibility} />
                </div>
                {page.description && (
                  <p className="mt-1 text-sm text-[var(--text-secondary)] line-clamp-2">{page.description}</p>
                )}
                <p className="mt-2 text-[11px] text-[var(--text-muted)]">
                  {new Date(page.createdAt).toLocaleDateString("pl-PL")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
