import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Pin } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/format-time";
import { CopyLinkButton } from "@/components/shared/copy-link-button";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const a = await prisma.announcement.findUnique({
    where: { id: params.id },
    select: { title: true },
  });
  return { title: a?.title ? `${a.title} — Ogłoszenia` : "Ogłoszenie" };
}

export default async function AnnouncementDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const isAdmin = session.user.role === "ADMIN";

  const a = await prisma.announcement.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { username: true, email: true } },
      category: { select: { name: true, color: true } },
    },
  });

  if (!a) notFound();

  const color = a.category?.color ?? "#9d6bff";

  return (
    <div className="p-[26px] md:px-[30px]">
      <div className="mx-auto max-w-[760px]">
        <Link
          href="/ogloszenia"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Wszystkie ogłoszenia
        </Link>

        <article className="glow-card p-[24px_26px]">
          <div className="mb-4 flex flex-wrap items-center gap-[9px]">
            {a.pinned && (
              <Pin
                className="h-4 w-4 shrink-0 text-[var(--accent-soft)]"
                fill="currentColor"
              />
            )}
            {a.category && (
              <span
                className="shrink-0 rounded-[5px] px-[8px] py-[3px] text-[10.5px] font-semibold"
                style={{ background: color + "1a", color }}
              >
                {a.category.name}
              </span>
            )}
            <span className="ml-auto flex items-center gap-3 text-[12px] text-[var(--text-muted)]">
              {timeAgo(a.createdAt)} · {a.author.username || a.author.email}
              {isAdmin && (
                <CopyLinkButton path={`/ogloszenia/${a.id}`} />
              )}
            </span>
          </div>

          <h1 className="font-display text-[22px] font-semibold text-[var(--text-primary)]">
            {a.title}
          </h1>

          <div
            className="lesson-content mt-4 text-[14px] leading-[1.7] text-[var(--text-secondary)]"
            dangerouslySetInnerHTML={{ __html: a.content }}
          />
        </article>
      </div>
    </div>
  );
}
