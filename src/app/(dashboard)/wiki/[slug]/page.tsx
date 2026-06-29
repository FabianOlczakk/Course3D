import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ArrowLeft, Pencil } from "lucide-react";
import { timeAgo } from "@/lib/format-time";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await prisma.wikiArticle.findUnique({ where: { slug: params.slug }, select: { title: true } });
  return { title: article ? `${article.title} | Wiki` : "Wiki" };
}

export default async function WikiArticlePage({ params }: { params: { slug: string } }) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const article = await prisma.wikiArticle.findUnique({
    where: { slug: params.slug },
    include: { author: { select: { username: true, email: true } } },
  });

  if (!article || (!article.published && !isAdmin)) notFound();

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link href="/wiki" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary">
          <ArrowLeft className="h-4 w-4" />
          Powrót do Wiki
        </Link>
        {isAdmin && (
          <Link
            href={`/admin/wiki/${params.slug}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-subtle)] px-3 py-1.5 text-sm text-text-secondary hover:border-[var(--border-glow)] hover:text-text-primary transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edytuj
          </Link>
        )}
      </div>

      <div className="glow-card p-6 md:p-8">
        <div className="mb-2 flex items-center gap-2 text-xs text-text-muted">
          {article.category && (
            <>
              <span className="rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-text-secondary">
                {article.category}
              </span>
              <span>·</span>
            </>
          )}
          {!article.published && (
            <span className="text-amber-400">[Ukryty] ·</span>
          )}
          <span>Zaktualizowany {timeAgo(new Date(article.updatedAt))}</span>
          <span>· przez {article.author.username ?? article.author.email}</span>
        </div>

        <h1 className="mb-6 text-2xl font-bold text-text-primary">{article.title}</h1>

        <div
          className="prose prose-invert max-w-none text-text-secondary prose-headings:text-text-primary prose-a:text-[var(--accent)] prose-code:bg-[var(--bg-base)] prose-code:px-1 prose-code:rounded prose-pre:bg-[var(--bg-base)]"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
    </div>
  );
}
