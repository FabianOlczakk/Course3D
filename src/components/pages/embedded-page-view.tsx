import Link from "next/link";
import { ArrowLeft, Lock, Pencil, Users } from "lucide-react";

interface PageData {
  title: string;
  slug: string;
  description: string | null;
  content: string;
  visibility: "USERS" | "ADMIN";
  updatedAt: string;
}

function VisBadge({ v }: { v: "USERS" | "ADMIN" }) {
  if (v === "ADMIN") return (
    <span className="inline-flex items-center gap-1 rounded-[4px] bg-[var(--accent-glow)] px-2 py-0.5 text-[10px] font-semibold text-[var(--accent-soft)]">
      <Lock className="h-2.5 w-2.5" /> Tylko admin
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-[4px] bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
      <Users className="h-2.5 w-2.5" /> Kursanci
    </span>
  );
}

export function EmbeddedPageView({ page, isAdmin }: { page: PageData; isAdmin: boolean }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 md:p-8">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Pulpit
        </Link>
        {isAdmin && (
          <Link
            href={`/admin/strony?edit=${page.slug}`}
            className="ml-auto inline-flex items-center gap-1.5 rounded-[6px] border border-[var(--border-subtle)] px-3 py-1.5 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edytuj
          </Link>
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-[26px] font-bold text-[var(--text-primary)]">{page.title}</h1>
          <VisBadge v={page.visibility} />
        </div>
        {page.description && (
          <p className="mt-2 text-[var(--text-secondary)]">{page.description}</p>
        )}
        <p className="mt-1 text-[11px] text-[var(--text-muted)]">
          Ostatnia aktualizacja: {new Date(page.updatedAt).toLocaleDateString("pl-PL")}
        </p>
      </div>

      <div
        className="glow-card prose prose-neutral max-w-none p-6 dark:prose-invert
          [&_h1]:text-[var(--text-primary)] [&_h2]:text-[var(--text-primary)]
          [&_h3]:text-[var(--text-primary)] [&_p]:text-[var(--text-secondary)]
          [&_a]:text-[var(--accent)] [&_li]:text-[var(--text-secondary)]
          [&_strong]:text-[var(--text-primary)]"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
