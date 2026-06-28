"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  MessageCircle,
  Mail,
  Bell,
  BookOpen,
  Boxes,
  Users,
  SlidersHorizontal,
  ChevronRight,
  X,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";
import { useProgress } from "@/lib/use-progress";
import {
  ChapterList,
  type SidebarChapter,
} from "@/components/chapters/chapter-list";

type NavIcon = React.ComponentType<{ className?: string }>;

/** Pozycja menu: link do trasy LUB akcja (np. otwarcie panelu). */
interface NavItem {
  key: string;
  label: string;
  icon: NavIcon;
  href?: string;
  event?: string;
  badge?: number;
}

function colorFromString(str: string): string {
  const palette = ["#9d6bff", "#5b8def", "#3ecf8e", "#e0944a", "#d9536a"];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export function Sidebar({
  username,
  email,
  role,
  avatarUrl,
  chapters,
  mobileOpen = false,
  onMobileClose,
}: {
  username: string | null;
  email: string;
  role: Role;
  avatarUrl?: string | null;
  chapters: SidebarChapter[];
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { progress } = useProgress();

  const [unreadMsg, setUnreadMsg] = useState(0);
  const [unreadAnn, setUnreadAnn] = useState(0);
  const [courseOpen, setCourseOpen] = useState(
    chapters.some((c) => c.lessons.some((l) => pathname === `/kurs/${l.id}`))
  );

  // Liczniki powiadomień (wiadomości + ogłoszenia)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/messages/unread-count");
        if (res.ok) {
          const d = await res.json();
          if (!cancelled) setUnreadMsg(d.count ?? 0);
        }
      } catch {
        /* ignore */
      }
      try {
        const res = await fetch("/api/announcements");
        if (res.ok) {
          const d = await res.json();
          const list: { createdAt: string }[] = d.announcements ?? [];
          const lastSeen = Number(
            localStorage.getItem("announcements-last-seen") || 0
          );
          const count = list.filter(
            (a) => new Date(a.createdAt).getTime() > lastSeen
          ).length;
          if (!cancelled) setUnreadAnn(count);
        }
      } catch {
        /* ignore */
      }
    }
    void load();
    const id = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [pathname]);

  // Postęp całego kursu
  const courseStats = useMemo(() => {
    const total = chapters.reduce((s, c) => s + c.lessons.length, 0);
    const done = chapters.reduce(
      (s, c) => s + c.lessons.filter((l) => progress[l.id]?.completed).length,
      0
    );
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const currentIdx = Math.max(
      0,
      chapters.findIndex(
        (c) => !c.lessons.every((l) => progress[l.id]?.completed)
      )
    );
    return { total, done, pct, currentIdx, count: chapters.length };
  }, [chapters, progress]);

  const platformNav: NavItem[] = [
    { key: "pulpit", label: "Pulpit", icon: Home, href: "/dashboard" },
    {
      key: "spol",
      label: "Społeczność",
      icon: MessageCircle,
      href: "/spolecznosc",
    },
    {
      key: "wiad",
      label: "Wiadomości",
      icon: Mail,
      event: "open-messages",
      badge: unreadMsg,
    },
    {
      key: "ogl",
      label: "Ogłoszenia",
      icon: Bell,
      event: "open-announcements",
      badge: unreadAnn,
    },
    { key: "wiki", label: "Wiki", icon: BookOpen, href: "/wiki" },
  ];

  const adminNav: NavItem[] = [
    { key: "users", label: "Użytkownicy", icon: Users, href: "/admin/users" },
    { key: "chapters", label: "Rozdziały", icon: Boxes, href: "/admin/chapters" },
    {
      key: "adminOgl",
      label: "Ogłoszenia",
      icon: Bell,
      href: "/admin/ogloszenia",
    },
    { key: "adminWiki", label: "Wiki", icon: Pencil, href: "/admin/wiki/new" },
  ];

  function isActive(item: NavItem) {
    if (!item.href) return false;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  }

  function handleClick(item: NavItem) {
    onMobileClose?.();
    if (item.event) {
      window.dispatchEvent(new CustomEvent(item.event));
    } else if (item.href) {
      router.push(item.href);
    }
  }

  const navButton = (item: NavItem) => {
    const active = isActive(item);
    return (
      <button
        key={item.key}
        onClick={() => handleClick(item)}
        className={cn(
          "relative flex w-full items-center gap-[11px] rounded-[7px] px-[11px] py-2 text-left text-[13.5px] font-medium transition-colors",
          active
            ? "bg-[#ffffff0d] text-[#ededed]"
            : "text-[#b4b4b4] hover:bg-[#ffffff09] hover:text-[#ededed]"
        )}
      >
        {active && (
          <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-[2px] bg-[var(--accent)]" />
        )}
        <item.icon
          className={cn(
            "h-[18px] w-[18px] shrink-0",
            active ? "text-[var(--accent)]" : "text-[#8a8a8a]"
          )}
        />
        <span className="flex-1">{item.label}</span>
        {item.badge ? (
          <span
            className={cn(
              "flex h-[17px] min-w-[17px] items-center justify-center rounded-[5px] px-[5px] text-[10.5px] font-semibold",
              item.key === "ogl"
                ? "bg-[var(--accent)] text-white"
                : "bg-[#2e2e2e] text-[#cfcfcf]"
            )}
          >
            {item.badge > 99 ? "99+" : item.badge}
          </span>
        ) : null}
      </button>
    );
  };

  const groupLabel = (text: string, extra?: React.ReactNode) => (
    <div className="flex items-center gap-[6px] px-[10px] pb-[6px] pt-4 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#5f5f5f]">
      {text}
      {extra}
    </div>
  );

  const initials = (username || email).slice(0, 2).toUpperCase();
  const avatarColor = colorFromString(username || email);

  const content = (
    <>
      {/* HEADER — branding (bez ikony) */}
      <div className="flex items-center justify-between gap-2 border-b border-[#2b2b2b] px-[18px] py-4">
        <Link href="/dashboard" onClick={onMobileClose} className="min-w-0">
          <div className="truncate font-display text-[14px] font-semibold leading-[1.1] text-[#f0f0f0]">
            Kurs druku 3D
          </div>
          <div className="mt-[2px] text-[11px] text-[#6e6e6e]">
            BambuLab A1 mini
          </div>
        </Link>
        {onMobileClose && (
          <button
            type="button"
            aria-label="Zamknij menu"
            onClick={onMobileClose}
            className="glow-icon-btn shrink-0 md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* NAV */}
      <div className="flex-1 overflow-y-auto px-[10px] pb-4 pt-[10px]">
        {groupLabel("Platforma")}
        <div className="space-y-[1px]">{platformNav.map(navButton)}</div>

        {groupLabel("Nauka")}
        {/* Widget postępu kursu z rozwijaną listą rozdziałów */}
        <button
          onClick={() => setCourseOpen((o) => !o)}
          className="relative flex w-full items-start gap-[11px] rounded-[7px] px-[11px] py-[10px] text-left transition-colors hover:bg-[#ffffff09]"
        >
          <Boxes className="mt-[1px] h-[18px] w-[18px] shrink-0 text-[#8a8a8a]" />
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-medium text-[#ededed]">
              Kurs: Druk 3D
            </span>
            <span className="my-1 block text-[11px] text-[#6e6e6e]">
              {courseStats.count > 0
                ? `Rozdział ${courseStats.currentIdx + 1} z ${courseStats.count} · ${courseStats.pct}%`
                : "Brak rozdziałów"}
            </span>
            <span className="block h-1 overflow-hidden rounded-[3px] bg-[#2b2b2b]">
              <span
                className="block h-full rounded-[3px] bg-[var(--accent)] transition-all"
                style={{ width: `${courseStats.pct}%` }}
              />
            </span>
          </span>
          <ChevronRight
            className={cn(
              "mt-[1px] h-4 w-4 shrink-0 text-[#6e6e6e] transition-transform",
              courseOpen && "rotate-90"
            )}
          />
        </button>

        {courseOpen && (
          <div className="mt-1 pl-1">
            <ChapterList chapters={chapters} onNavigate={onMobileClose} />
          </div>
        )}

        {/* ADMIN */}
        {role === "ADMIN" &&
          groupLabel(
            "Administracja",
            <span className="rounded-[4px] bg-[#9d6bff1f] px-[6px] py-[2px] text-[9px] tracking-[0.03em] text-[var(--accent-soft)]">
              INSTRUKTOR
            </span>
          )}
        {role === "ADMIN" && (
          <div className="space-y-[1px]">{adminNav.map(navButton)}</div>
        )}
      </div>

      {/* FOOTER — użytkownik z kropką obecności */}
      <div className="flex items-center gap-[10px] border-t border-[#2b2b2b] p-[11px]">
        <div className="relative shrink-0">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={username || email}
              className="h-[34px] w-[34px] rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-[12px] font-semibold text-white"
              style={{ background: avatarColor }}
            >
              {initials}
            </div>
          )}
          <div className="absolute -bottom-[1px] -right-[1px] h-[11px] w-[11px] rounded-full border-2 border-[#1c1c1c] bg-[var(--green)]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-[#ededed]">
            {username || "Użytkownik"}
          </div>
          <div className="text-[11px] text-[#6e6e6e]">
            {role === "ADMIN" ? "Instruktor" : "Kursant"}
          </div>
        </div>
        <Link
          href="/profile"
          onClick={onMobileClose}
          title="Ustawienia profilu"
          className="flex h-[30px] w-[30px] items-center justify-center rounded-[6px] text-[#7a7a7a] transition-colors hover:bg-[#ffffff0a] hover:text-[#cfcfcf]"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-[248px] shrink-0 flex-col border-r border-[#2b2b2b] bg-[#1c1c1c] md:flex">
        {content}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-hidden
          />
          <aside className="relative z-10 flex h-full w-[248px] max-w-[80vw] flex-col border-r border-[#2b2b2b] bg-[#1c1c1c]">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
