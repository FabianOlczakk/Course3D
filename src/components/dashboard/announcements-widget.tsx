"use client";

import { useState } from "react";
import Link from "next/link";
import { timeAgo } from "@/lib/format-time";

interface Category {
  id: string;
  name: string;
  color: string | null;
}

interface AnnouncementRow {
  id: string;
  title: string;
  createdAt: Date | string;
  category: { name: string; color: string | null } | null;
  categoryId: string | null;
}

interface Props {
  announcements: AnnouncementRow[];
  categories: Category[];
}

export function AnnouncementsWidget({ announcements, categories }: Props) {
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const shown = activeCat
    ? announcements.filter((a) => a.categoryId === activeCat)
    : announcements;

  return (
    <>
      {categories.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setActiveCat(null)}
            className={
              "rounded-[5px] px-2.5 py-1 text-[11px] font-semibold transition-colors " +
              (!activeCat
                ? "bg-[#9d6bff1a] text-[var(--accent-soft)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]")
            }
          >
            Wszystko
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCat(c.id === activeCat ? null : c.id)}
              className="rounded-[5px] px-2.5 py-1 text-[11px] font-semibold transition-colors"
              style={
                activeCat === c.id
                  ? { background: (c.color || "#9d6bff") + "1a", color: c.color || "#b89dff" }
                  : { color: "var(--text-muted)" }
              }
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="py-2 text-[12.5px] text-[var(--text-muted)]">Brak ogłoszeń.</p>
      ) : (
        shown.slice(0, 3).map((a) => (
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
