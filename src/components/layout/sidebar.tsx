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
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";
import { useProgress } from "@/lib/use-progress";
import {
  ChapterList,
  type SidebarChapter,
} from "@/components/chapters/chapter-list";

function colorFromString(str: string): string {
  const palette = ["#9d6bff", "#5b8def", "#3ecf8e", "#e0944a", "#d9536a"];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

interface Conversation {
  userId: string;
  username: string | null;
  email: string;
  avatarUrl: string | null;
  lastMessage: string;
  unreadCount: number;
}

interface WikiArticleMini {
  id: string;
  title: string;
  slug: string;
  category: string | null;
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
  const [wiadOpen, setWiadOpen] = useState(false);
  const [wikiOpen, setWikiOpen] = useState(pathname.startsWith("/wiki"));
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [wikiArticles, setWikiArticles] = useState<WikiArticleMini[]>([]);
  const [openWikiCat, setOpenWikiCat] = useState<string | null>(null);
  const [profileMenu, setProfileMenu] = useState(false);

  // Liczniki powiadomień
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

  // Lazy: konwersacje przy rozwinięciu Wiadomości
  useEffect(() => {
    if (!wiadOpen) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/messages/conversations");
        if (res.ok) {
          const d = await res.json();
          if (!cancelled) setConversations(d.conversations ?? []);
        }
      } catch {
        /* ignore */
      }
    })();
  }, [wiadOpen]);

  // Lazy: artykuły wiki przy rozwinięciu
  useEffect(() => {
    if (!wikiOpen) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/wiki");
        if (res.ok) {
          const d = await res.json();
          if (!cancelled) setWikiArticles(d.articles ?? []);
        }
      } catch {
        /* ignore */
      }
    })();
  }, [wikiOpen]);

  const wikiByCategory = useMemo(() => {
    const map = new Map<string, WikiArticleMini[]>();
    for (const a of wikiArticles) {
      const cat = a.category || "Inne";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(a);
    }
    return Array.from(map.entries());
  }, [wikiArticles]);

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
    return { pct, currentIdx, count: chapters.length };
  }, [chapters, progress]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  // Prosty przycisk nawigacji (link)
  const linkButton = (
    key: string,
    label: string,
    icon: React.ComponentType<{ className?: string }>,
    href: string
  ) => {
    const Icon = icon;
    const active = isActive(href);
    return (
      <button
        key={key}
        onClick={() => {
          onMobileClose?.();
          router.push(href);
        }}
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
        <Icon
          className={cn(
            "h-[18px] w-[18px] shrink-0",
            active ? "text-[var(--accent)]" : "text-[#8a8a8a]"
          )}
        />
        <span className="flex-1">{label}</span>
      </button>
    );
  };

  // Przycisk z plakietką i rozwijaniem lub akcją
  const expandRow = (
    label: string,
    icon: React.ComponentType<{ className?: string }>,
    {
      open,
      onToggle,
      badge,
      badgeAccent,
    }: { open?: boolean; onToggle: () => void; badge?: number; badgeAccent?: boolean }
  ) => {
    const Icon = icon;
    return (
      <button
        onClick={onToggle}
        className="relative flex w-full items-center gap-[11px] rounded-[7px] px-[11px] py-2 text-left text-[13.5px] font-medium text-[#b4b4b4] transition-colors hover:bg-[#ffffff09] hover:text-[#ededed]"
      >
        <Icon className="h-[18px] w-[18px] shrink-0 text-[#8a8a8a]" />
        <span className="flex-1">{label}</span>
        {badge ? (
          <span
            className={cn(
              "flex h-[17px] min-w-[17px] items-center justify-center rounded-[5px] px-[5px] text-[10.5px] font-semibold",
              badgeAccent
                ? "bg-[var(--accent)] text-white"
                : "bg-[#2e2e2e] text-[#cfcfcf]"
            )}
          >
            {badge > 99 ? "99+" : badge}
          </span>
        ) : null}
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-[#6e6e6e] transition-transform",
            open && "rotate-90"
          )}
        />
      </button>
    );
  };

  const groupLabel = (text: string, extra?: React.ReactNode) => (
    <div className="flex items-center gap-[6px] px-[10px] pb-[6px] pt-4 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#5f5f5f]">
      {text}
      {extra}
    </div>
  );

  // Kontener podgrupy — wyraźnie zagnieżdżony (wcięcie + lewa krawędź)
  const subgroup = (children: React.ReactNode) => (
    <div className="my-1 ml-[20px] border-l border-[#333] pl-[10px]">
      {children}
    </div>
  );

  const initials = (username || email).slice(0, 2).toUpperCase();
  const avatarColor = colorFromString(username || email);

  const content = (
    <>
      {/* HEADER — branding bez ikony */}
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
        <div className="space-y-[1px]">
          {linkButton("pulpit", "Pulpit", Home, "/dashboard")}
          {linkButton("spol", "Społeczność", MessageCircle, "/spolecznosc")}

          {/* Wiadomości — rozwijane (5 ostatnich + Więcej) */}
          {expandRow("Wiadomości", Mail, {
            open: wiadOpen,
            onToggle: () => setWiadOpen((o) => !o),
            badge: unreadMsg,
          })}
          {wiadOpen &&
            subgroup(
              <>
                {conversations.length === 0 ? (
                  <p className="px-2 py-1.5 text-[12px] text-[#6e6e6e]">
                    Brak rozmów.
                  </p>
                ) : (
                  conversations.slice(0, 5).map((c) => {
                    const label = c.username || c.email;
                    return (
                      <button
                        key={c.userId}
                        onClick={() => {
                          onMobileClose?.();
                          router.push(`/wiadomosci?u=${c.userId}`);
                        }}
                        className="flex w-full items-center gap-2 rounded-[6px] px-2 py-1.5 text-left transition-colors hover:bg-[#ffffff09]"
                      >
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                          style={{ background: colorFromString(label) }}
                        >
                          {label.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12.5px] text-[#cfcfcf]">
                            {label}
                          </span>
                        </span>
                        {c.unreadCount > 0 && (
                          <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--accent)]" />
                        )}
                      </button>
                    );
                  })
                )}
                <Link
                  href="/wiadomosci"
                  onClick={onMobileClose}
                  className="mt-1 block rounded-[6px] px-2 py-1.5 text-[12.5px] font-semibold text-[var(--accent-soft)] hover:bg-[#ffffff09]"
                >
                  Więcej →
                </Link>
              </>
            )}

          {/* Ogłoszenia — panel (drawer) */}
          <button
            onClick={() => {
              onMobileClose?.();
              window.dispatchEvent(new CustomEvent("open-announcements"));
            }}
            className="relative flex w-full items-center gap-[11px] rounded-[7px] px-[11px] py-2 text-left text-[13.5px] font-medium text-[#b4b4b4] transition-colors hover:bg-[#ffffff09] hover:text-[#ededed]"
          >
            <Bell className="h-[18px] w-[18px] shrink-0 text-[#8a8a8a]" />
            <span className="flex-1">Ogłoszenia</span>
            {unreadAnn > 0 && (
              <span className="flex h-[17px] min-w-[17px] items-center justify-center rounded-[5px] bg-[var(--accent)] px-[5px] text-[10.5px] font-semibold text-white">
                {unreadAnn > 99 ? "99+" : unreadAnn}
              </span>
            )}
          </button>

          {/* Wiki — rozwijane (kategorie → artykuły) */}
          {expandRow("Wiki", BookOpen, {
            open: wikiOpen,
            onToggle: () => setWikiOpen((o) => !o),
          })}
          {wikiOpen &&
            subgroup(
              wikiByCategory.length === 0 ? (
                <p className="px-2 py-1.5 text-[12px] text-[#6e6e6e]">
                  Brak artykułów.
                </p>
              ) : (
                wikiByCategory.map(([cat, arts]) => {
                  const catOpen = openWikiCat === cat;
                  return (
                    <div key={cat}>
                      <button
                        onClick={() => setOpenWikiCat(catOpen ? null : cat)}
                        className="flex w-full items-center gap-2 rounded-[6px] px-2 py-1.5 text-left text-[12px] font-semibold uppercase tracking-[0.03em] text-[#7a7a7a] transition-colors hover:bg-[#ffffff09]"
                      >
                        <ChevronRight
                          className={cn(
                            "h-3.5 w-3.5 shrink-0 transition-transform",
                            catOpen && "rotate-90"
                          )}
                        />
                        <span className="flex-1 truncate">{cat}</span>
                        <span className="text-[10px] text-[#5f5f5f]">
                          {arts.length}
                        </span>
                      </button>
                      {catOpen &&
                        subgroup(
                          arts.map((a) => {
                            const active = pathname === `/wiki/${a.slug}`;
                            return (
                              <Link
                                key={a.id}
                                href={`/wiki/${a.slug}`}
                                onClick={onMobileClose}
                                className={cn(
                                  "block truncate rounded-[6px] px-2 py-1.5 text-[12.5px] transition-colors",
                                  active
                                    ? "bg-[#9d6bff14] text-[var(--accent-soft)]"
                                    : "text-[#cfcfcf] hover:bg-[#ffffff09]"
                                )}
                              >
                                {a.title}
                              </Link>
                            );
                          })
                        )}
                    </div>
                  );
                })
              )
            )}
        </div>

        {/* NAUKA — widget kursu z rozwijanymi rozdziałami */}
        {groupLabel("Nauka")}
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
        {courseOpen && subgroup(<ChapterList chapters={chapters} onNavigate={onMobileClose} />)}

        {/* ADMIN */}
        {role === "ADMIN" && (
          <>
            {groupLabel(
              "Administracja",
              <span className="rounded-[4px] bg-[#9d6bff1f] px-[6px] py-[2px] text-[9px] tracking-[0.03em] text-[var(--accent-soft)]">
                INSTRUKTOR
              </span>
            )}
            <div className="space-y-[1px]">
              {linkButton("users", "Użytkownicy", Users, "/admin/users")}
              {linkButton("chapters", "Rozdziały", Boxes, "/admin/chapters")}
              {linkButton("adminOgl", "Ogłoszenia", Bell, "/admin/ogloszenia")}
              {linkButton("adminWiki", "Wiki", Pencil, "/admin/wiki/new")}
            </div>
          </>
        )}
      </div>

      {/* FOOTER — użytkownik + kropka obecności + menu (profil/wyloguj) */}
      <div className="relative flex items-center gap-[10px] border-t border-[#2b2b2b] p-[11px]">
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
        <button
          onClick={() => setProfileMenu((o) => !o)}
          title="Ustawienia"
          className="flex h-[30px] w-[30px] items-center justify-center rounded-[6px] text-[#7a7a7a] transition-colors hover:bg-[#ffffff0a] hover:text-[#cfcfcf]"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>

        {profileMenu && (
          <div className="absolute bottom-[52px] right-[11px] z-50 w-[180px] overflow-hidden rounded-[8px] border border-[#2b2b2b] bg-[#1e1e1e] shadow-xl">
            <Link
              href="/profile"
              onClick={() => {
                setProfileMenu(false);
                onMobileClose?.();
              }}
              className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#cfcfcf] hover:bg-[#ffffff09]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Profil i ustawienia
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-[#e07686] hover:bg-[#ffffff09]"
            >
              <LogOut className="h-4 w-4" />
              Wyloguj się
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden w-[248px] shrink-0 flex-col border-r border-[#2b2b2b] bg-[#1c1c1c] md:flex">
        {content}
      </aside>

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
