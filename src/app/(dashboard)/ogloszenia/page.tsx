import type { Metadata } from "next";
import { Pin, Bell } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/format-time";

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
  author: { username: string | null; email: string };
  category: { name: string; color: string | null } | null;
}

export default async function AnnouncementsPage() {
  let announcements: AnnouncementRow[] = [];

  try {
    announcements = await prisma.announcement.findMany({
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      include: {
        author: { select: { username: true, email: true } },
        category: { select: { name: true, color: true } },
      },
    });
  } catch {
    announcements = [];
  }

  return (
    <div className="p-[26px] md:px-[30px]">
      <div className="mx-auto max-w-[760px]">
        <h1 className="flex items-center gap-2 font-display text-[23px] font-semibold text-[#f0f0f0]">
          <Bell className="h-6 w-6 text-[var(--accent)]" />
          Ogłoszenia
        </h1>
        <p className="mb-[22px] mt-[6px] text-[13.5px] text-[#8a8a8a]">
          Najważniejsze informacje od zespołu kursu
        </p>

        {announcements.length === 0 ? (
          <div className="rounded-[10px] border border-[#2b2b2b] bg-[#1e1e1e] p-8 text-center text-[13.5px] text-[#8a8a8a]">
            Brak ogłoszeń.
          </div>
        ) : (
          announcements.map((a) => {
            const author = a.author;
            const category = a.category;
            const color = category?.color || "#9d6bff";
            return (
              <div
                key={a.id}
                className="mb-3 rounded-[10px] border border-[#2b2b2b] bg-[#1e1e1e] p-[18px_20px]"
              >
                <div className="mb-[9px] flex items-center gap-[9px]">
                  {a.pinned && (
                    <Pin className="h-3.5 w-3.5 text-[var(--accent-soft)]" fill="currentColor" />
                  )}
                  {category && (
                    <span
                      className="rounded-[5px] px-[8px] py-[3px] text-[10.5px] font-semibold"
                      style={{ background: color + "1a", color }}
                    >
                      {category.name}
                    </span>
                  )}
                  <span className="ml-auto text-[11.5px] text-[#6e6e6e]">
                    {timeAgo(a.createdAt)} · {author.username || author.email}
                  </span>
                </div>
                <h3 className="mb-[7px] font-display text-[17px] font-semibold text-[#f0f0f0]">
                  {a.title}
                </h3>
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
