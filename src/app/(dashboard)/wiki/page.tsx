import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { BookOpen, Plus, FileText } from "lucide-react";
import { timeAgo } from "@/lib/format-time";

export const metadata: Metadata = { title: "Wiki | Interaktywny Kurs Druku 3D" };
export const dynamic = "force-dynamic";

export default async function WikiPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const articles = await prisma.wikiArticle.findMany({
    where: isAdmin ? {} : { published: true },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, title: true, slug: true, category: true,
      published: true, createdAt: true, updatedAt: true,
    },
  });

  // Grupuj po kategorii
  const grouped: Record<string, typeof articles> = {};
  for (const a of articles) {
    const cat = a.category ?? "Inne";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(a);
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-text-primary">
            <BookOpen className="h-6 w-6 text-[var(--accent)]" />
            Wiki kursu
          </h1>
          <p className="mt-1 text-text-secondary">
            Materiały uzupełniające: kody błędów HMS, wymiana części, procedury konserwacji i więcej.
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/admin/wiki/new"
            className="inline-flex shrink-0 items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#8a5af0]"
          >
            <Plus className="h-4 w-4" />
            Nowy artykuł
          </Link>
        )}
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="glow-card p-10 text-center text-text-secondary">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-text-muted" />
          <p>Brak artykułów wiki.</p>
          {isAdmin && (
            <Link href="/admin/wiki/new" className="mt-3 inline-block text-sm text-[var(--accent)] hover:underline">
              Dodaj pierwszy artykuł →
            </Link>
          )}
        </div>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">{category}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((a) => (
                <Link
                  key={a.id}
                  href={`/wiki/${a.slug}`}
                  className={`glow-card flex items-start gap-3 p-4 transition-colors hover:border-[var(--border-glow)] ${!a.published ? "opacity-60" : ""}`}
                >
                  <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary">{a.title}</p>
                    <p className="text-xs text-text-muted mt-1">
                      {!a.published && <span className="mr-2 text-amber-400">[Ukryty]</span>}
                      Zaktualizowany {timeAgo(new Date(a.updatedAt))}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
