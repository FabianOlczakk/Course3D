import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

interface Page {
  title: string;
  slug: string;
  description: string | null;
  content: string;
  updatedAt: Date;
}

export function StandalonePageView({ page }: { page: Page }) {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* Minimal header */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Strona główna
          </Link>
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <FileText className="h-4 w-4" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">{page.title}</h1>
          {page.description && (
            <p className="mt-2 text-[var(--text-secondary)]">{page.description}</p>
          )}
          <p className="mt-2 text-[11px] text-[var(--text-muted)]">
            Ostatnia aktualizacja: {new Date(page.updatedAt).toLocaleDateString("pl-PL")}
          </p>
        </div>

        <div
          className="prose prose-neutral max-w-none dark:prose-invert
            [&_h1]:text-[var(--text-primary)] [&_h2]:text-[var(--text-primary)]
            [&_h3]:text-[var(--text-primary)] [&_p]:text-[var(--text-secondary)]
            [&_a]:text-[var(--accent)] [&_li]:text-[var(--text-secondary)]
            [&_strong]:text-[var(--text-primary)]"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-[var(--border-subtle)] px-6 py-6 text-center text-xs text-[var(--text-muted)]">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/polityka-prywatnosci" className="hover:text-[var(--text-secondary)]">Polityka prywatności</Link>
          <Link href="/regulamin" className="hover:text-[var(--text-secondary)]">Regulamin</Link>
          <Link href="/warunki" className="hover:text-[var(--text-secondary)]">Warunki usług</Link>
        </div>
      </footer>
    </div>
  );
}
