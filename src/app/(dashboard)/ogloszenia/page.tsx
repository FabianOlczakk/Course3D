import type { Metadata } from "next";
import Link from "next/link";
import { Pin, Bell } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { timeAgo } from "@/lib/format-time";
import { CopyLinkButton } from "@/components/shared/copy-link-button";
import { HighlightTarget } from "@/components/shared/highlight-target";

export const metadata: Metadata = {
  title: "Ogłoszenia — Kurs druku 3D",
};

export const dynamic = "force-dynamic";

interface AnnouncementRow {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: Date;
  categoryId: string | null;
  author: { username: string | null; email: string };
  category: { id: string; name: string; color: string | null } | null;
}

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: { cat?: string };
}) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const activeCat = searchParams.cat;
  let announcements: AnnouncementRow[] = [];
  let categories: { id: string; name: string; color: string | null }[] = [];

  try {
    [announcements, categories] = await Promise.all([
      prisma.announcement.findMany({
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        include: {
          author: { select: { username: true, email: true } },
          category: { select: { id: true, name: true, color: true } },
        },
      }),
      prisma.category.findMany({
        where: { type: "ANNOUNCEMENT" },
        orderBy: { name: "asc" },
        select: { id: true, name: true, color: true },
      }),
    ]);
  } catch {
    announcements = [];
  }

  const shown = activeCat
    ? announcements.filter((a) => a.categoryId === activeCat)
    : announcements;

  return (
    <div className="p-[26px] md:px-[30px]">
      <HighlightTarget param="a" prefix="a-" />
      <div className="mx-auto max-w-[760px]">
        <h1 className="flex items-center gap-2 font-display text-[23px] font-semibold text-[#f0f0f0]">
          <Bell className="h-6 w-6 text-[var(--accent)]" />
          Ogłoszenia
        </h1>
        <p className="mb-[18px] mt-[6px] text-[13.5px] text-[#8a8a8a]">
          Najważniejsze informacje od zespołu kursu
        </p>

        {categories.length > 0 && (
          <div className="mb-[18px] flex flex-wrap gap-2">
            <Link
              href="/ogloszenia"
              className={
                !activeCat
                  ? "rounded-md bg-[#9d6bff1a] px-3 py-1.5 text-[12.5px] font-semibold text-[var(--accent-soft)]"
                  : "rounded-md border border-[#2b2b2b] bg-[#1e1e1e] px-3 py-1.5 text-[12.5px] font-semibold text-[#b4b4b4] hover:text-[#ededed]"
              }
            >
              Wszystko
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/ogloszenia?cat=${c.id}`}
                className="rounded-md border border-[#2b2b2b] px-3 py-1.5 text-[12.5px] font-semibold"
                style={
                  activeCat === c.id
                    ? { background: (c.color || "#9d6bff") + "1a", color: c.color || "#b89dff", borderColor: "transparent" }
                    : { color: "#b4b4b4" }
                }
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}

        {shown.length === 0 ? (
          <div className="rounded-[10px] border border-[#2b2b2b] bg-[#1e1e1e] p-8 text-center text-[13.5px] text-[#8a8a8a]">
            Brak ogłoszeń.
          </div>
        ) : (
          shown.map((a) => {
            const author = a.author;
            const category = a.category;
            const color = category?.color || "#9d6bff";
            return (
              <div
                key={a.id}
                id={`a-${a.id}`}
                className="mb-3 rounded-[10px] border border-[#2b2b2b] bg-[#1e1e1e] p-[18px_20px]"
              >
                <div className="mb-[9px] flex items-center gap-[9px]">
                  {a.pinned && (
                    <Pin className="h-3.5 w-3.5 shrink-0 text-[var(--accent-soft)]" fill="currentColor" />
                  )}
                  {category && (
                    <span
                      className="shrink-0 rounded-[5px] px-[8px] py-[3px] text-[10.5px] font-semibold"
                      style={{ background: color + "1a", color }}
                    >
                      {category.name}
                    </span>
                  )}
                  <h3 className="min-w-0 flex-1 truncate font-display text-[17px] font-semibold text-[#f0f0f0]">
                    {a.title}
                  </h3>
                  <span className="shrink-0 text-[11.5px] text-[#6e6e6e]">
                    {timeAgo(a.createdAt)} · {author.username || author.email}
                  </span>
                  {isAdmin && <CopyLinkButton path={`/ogloszenia?a=${a.id}`} />}
                </div>
                <div
                  className="lesson-content text-[13.5px] leading-[1.6] text-[#9a9a9a]"
                  dangerouslySetInnerHTML={{ __html: a.content }}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
