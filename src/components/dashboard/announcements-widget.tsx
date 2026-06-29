import Link from "next/link";
import { timeAgo } from "@/lib/format-time";

interface AnnouncementRow {
  id: string;
  title: string;
  createdAt: Date | string;
  category: { name: string; color: string | null } | null;
  categoryId: string | null;
}

interface Props {
  announcements: AnnouncementRow[];
  categories?: unknown[];
}

export function AnnouncementsWidget({ announcements }: Props) {
  return (
    <>
      {announcements.length === 0 ? (
        <p className="py-2 text-[12.5px] text-[var(--text-muted)]">Brak ogłoszeń.</p>
      ) : (
        announcements.slice(0, 3).map((a) => (
          <Link
            key={a.id}
            href={`/ogloszenia/${a.id}`}
            className="block border-b border-[var(--border-subtle)] py-[11px] last:border-0 hover:opacity-80 transition-opacity"
          >
            <div className="mb-1 flex items-center gap-[7px]">
              <span
                className="rounded-[4px] px-[7px] py-[2px] text-[10px] font-semibold"
                style={{
                  background: (a.category?.color || "#9d6bff") + "1a",
                  color: a.category?.color || "var(--accent-soft)",
                }}
              >
                {a.category?.name || "Ogłoszenie"}
              </span>
              <span className="ml-auto text-[11px] text-[var(--text-muted)]">
                {timeAgo(String(a.createdAt))}
              </span>
            </div>
            <div className="text-[13px] font-semibold text-[var(--text-primary)]">
              {a.title}
            </div>
          </Link>
        ))
      )}
    </>
  );
}
