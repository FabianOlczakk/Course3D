import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StronaPage({ params }: { params: { slug: string } }) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  const page = await prisma.page.findUnique({ where: { slug: params.slug } });
  if (!page) notFound();

  if (page.visibility === "ADMIN" && role !== "ADMIN") notFound();
  if (page.visibility === "USERS" && !session?.user) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 md:p-8">
      <div className="flex items-center gap-2">
        <Link
          href="/strony"
          className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Strony
        </Link>
        {role === "ADMIN" && (
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
        <h1 className="font-display text-[26px] font-bold text-[var(--text-primary)]">{page.title}</h1>
        {page.description && (
          <p className="mt-2 text-[var(--text-secondary)]">{page.description}</p>
        )}
        <p className="mt-1 text-[11px] text-[var(--text-muted)]">
          Ostatnia aktualizacja: {new Date(page.updatedAt).toLocaleDateString("pl-PL")}
        </p>
      </div>

      <div
        className="glow-card prose prose-invert max-w-none p-6"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
