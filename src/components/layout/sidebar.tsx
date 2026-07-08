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
  UserCircle,
  ChevronRight,
  X,
  Pencil,
  LogOut,
  Loader2,
  Terminal,
  FileText,
  Star,
  ClipboardList,
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
  userId,
  username,
  email,
  role,
  avatarUrl,
  chapters,
  mobileOpen = false,
  onMobileClose,
}: {
  userId: string;
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

  // Szerokość paska bocznego z możliwością przeciągania (jak okno w Windows)
  useEffect(() => {
    const saved = Number(localStorage.getItem("sidebar-width"));
    const max = typeof window !== "undefined" ? window.innerWidth / 2 : 1000;
    if (saved >= 200 && saved <= max) setWidth(saved);
  }, []);

  function startResize(e: React.MouseEvent) {
    e.preventDefault();
    const onMove = (ev: MouseEvent) => {
      const max = Math.floor(window.innerWidth / 2);
      const w = Math.min(max, Math.max(200, ev.clientX));
      setWidth(w);
      localStorage.setItem("sidebar-width", String(w));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.userSelect = "";
    };
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  const [unreadMsg, setUnreadMsg] = useState(0);
  const [unreadAnn, setUnreadAnn] = useState(0);
  const [courseOpen, setCourseOpen] = useState(
    chapters.some((c) => c.lessons.some((l) => pathname === `/kurs/${l.id}`))
  );
  const [width, setWidth] = useState(248);
  const [wiadOpen, setWiadOpen] = useState(false);
  const [wikiOpen, setWikiOpen] = useState(pathname.startsWith("/wiki"));
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [wiadLoaded, setWiadLoaded] = useState(false);
  const [wikiLoaded, setWikiLoaded] = useState(false);
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
      } finally {
        if (!cancelled) setWiadLoaded(true);
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
      } finally {
        if (!cancelled) setWikiLoaded(true);
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
            ? "bg-[#ffffff0d] text-[var(--text-primary)]"
            : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
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
      href,
    }: {
      open?: boolean;
      onToggle: () => void;
      badge?: number;
      badgeAccent?: boolean;
      href?: string;
    }
  ) => {
    const Icon = icon;
    const badgeNode = badge ? (
      <span
        className={cn(
          "flex h-[17px] min-w-[17px] items-center justify-center rounded-[5px] px-[5px] text-[10.5px] font-semibold",
          badgeAccent
            ? "bg-[var(--accent)] text-white"
            : "bg-[var(--bg-elevated)] text-[var(--text-primary)]"
        )}
      >
        {badge > 99 ? "99+" : badge}
      </span>
    ) : null;

    if (href) {
      return (
        <div className="relative flex w-full items-center gap-[11px] rounded-[7px] px-[11px] py-2 text-[13.5px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]">
          <Link
            href={href}
            onClick={onMobileClose}
            className="flex flex-1 items-center gap-[11px] text-left"
          >
            <Icon className="h-[18px] w-[18px] shrink-0 text-[#8a8a8a]" />
            <span className="flex-1">{label}</span>
          </Link>
          {badgeNode}
          <button
            type="button"
            aria-label={open ? "Zwiń listę" : "Rozwiń listę"}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="-mr-1 shrink-0 rounded-[5px] p-1 hover:bg-[var(--bg-elevated)]"
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 shrink-0 text-[#6e6e6e] transition-transform",
                open && "rotate-90"
              )}
            />
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={onToggle}
        className="relative flex w-full items-center gap-[11px] rounded-[7px] px-[11px] py-2 text-left text-[13.5px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
      >
        <Icon className="h-[18px] w-[18px] shrink-0 text-[#8a8a8a]" />
        <span className="flex-1">{label}</span>
        {badgeNode}
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

  // Kontener podgrupy — wcięcie + delikatna lewa krawędź
  const subgroup = (children: React.ReactNode) => (
    <div className="my-1 ml-[20px] border-l border-[#333] pl-[10px]">
      {children}
    </div>
  );

  const spinnerRow = (
    <div className="flex items-center gap-2 px-2 py-1.5 text-[12px] text-[#6e6e6e]">
      <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--accent)]" />
      Wczytywanie…
    </div>
  );

  const initials = (username || email).slice(0, 2).toUpperCase();
  const avatarColor = colorFromString(username || email);

  const content = (
    <>
      {/* HEADER — branding bez ikony (wysokość = topbar, aby border się równał) */}
      <div className="flex h-14 items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-[18px]">
        <Link href="/dashboard" onClick={onMobileClose} className="flex min-w-0 items-center gap-2">
          <img
            src="/logo.svg"
            alt="Interaktywny Kurs Druku 3D"
            className="h-7 w-auto shrink-0 object-contain"
            draggable={false}
          />
          <span className="truncate font-display text-[13.5px] font-semibold text-[var(--text-primary)]">
            Interaktywny kurs 3D
          </span>
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

          {/* Ogłoszenia — pełna strona */}
          <button
            onClick={() => {
              onMobileClose?.();
              localStorage.setItem("announcements-last-seen", String(Date.now()));
              setUnreadAnn(0);
              router.push("/ogloszenia");
            }}
            className="relative flex w-full items-center gap-[11px] rounded-[7px] px-[11px] py-2 text-left text-[13.5px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
          >
            <Bell className="h-[18px] w-[18px] shrink-0 text-[#8a8a8a]" />
            <span className="flex-1">Ogłoszenia</span>
            {unreadAnn > 0 && (
              <span className="flex h-[17px] min-w-[17px] items-center justify-center rounded-[5px] bg-[var(--accent)] px-[5px] text-[10.5px] font-semibold text-white">
                {unreadAnn > 99 ? "99+" : unreadAnn}
              </span>
            )}
          </button>

          {/* Wiadomości — rozwijane (5 ostatnich + Więcej) */}
          {expandRow("Wiadomości", Mail, {
            open: wiadOpen,
            onToggle: () => setWiadOpen((o) => !o),
            badge: unreadMsg,
            href: "/wiadomosci",
          })}
          {wiadOpen &&
            subgroup(
              <>
                {!wiadLoaded ? (
                  spinnerRow
                ) : conversations.length === 0 ? (
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
                        className="flex w-full items-center gap-2 rounded-[6px] px-2 py-1.5 text-left transition-colors hover:bg-[#ffffff0d]"
                      >
                        {c.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.avatarUrl}
                            alt={label}
                            className="h-6 w-6 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                            style={{ background: colorFromString(label) }}
                          >
                            {label.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12.5px] text-[var(--text-primary)]">
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
                  className="mt-1.5 flex items-center justify-center gap-1 rounded-md bg-[#9d6bff1a] px-2 py-1.5 text-[12px] font-semibold text-[var(--accent-soft)] transition-colors hover:bg-[#9d6bff2e]"
                >
                  Zobacz wszystkie
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}

          {/* Wiki — rozwijane (kategorie → artykuły) */}
          {expandRow("Wiki", BookOpen, {
            open: wikiOpen,
            onToggle: () => setWikiOpen((o) => !o),
            href: "/wiki",
          })}
          {wikiOpen &&
            subgroup(
              !wikiLoaded ? (
                spinnerRow
              ) : wikiByCategory.length === 0 ? (
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
                        className="flex w-full items-center gap-2 rounded-[6px] px-2 py-1.5 text-left text-[12px] font-semibold uppercase tracking-[0.03em] text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)]"
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
                                    : "text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
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
          className="relative flex w-full items-start gap-[11px] rounded-[7px] px-[11px] py-[10px] text-left transition-colors hover:bg-[var(--bg-elevated)]"
        >
          <Boxes className="mt-[1px] h-[18px] w-[18px] shrink-0 text-[#8a8a8a]" />
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-medium text-[var(--text-primary)]">
              Kurs: Druk 3D
            </span>
            <span className="my-1 block text-[11px] text-[#6e6e6e]">
              {courseStats.count > 0
                ? `Rozdział ${courseStats.currentIdx + 1} z ${courseStats.count} · ${courseStats.pct}%`
                : "Brak rozdziałów"}
            </span>
            <span className="block h-1 overflow-hidden rounded-[3px] bg-[var(--bg-elevated)]">
              <span
                className="block h-full rounded-[3px] bg-[var(--green)] transition-all"
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
              {[
                { label: "Użytkownicy", icon: Users, href: "/admin/users" },
                { label: "Rozdziały", icon: Boxes, href: "/admin/chapters" },
                { label: "Ogłoszenia", icon: Bell, href: "/admin/ogloszenia" },
                { label: "Wiki", icon: Pencil, href: "/admin/wiki/new" },
                { label: "Oceny", icon: Star, href: "/admin/oceny" },
                { label: "Strony", icon: FileText, href: "/admin/strony" },
                { label: "Formularze", icon: ClipboardList, href: "/admin/formularze" },
                { label: "Email", icon: Mail, href: "/admin/email" },
                { label: "Deweloper", icon: Terminal, href: "/admin/developer" },
              ].map((it) => {
                const Icon = it.icon;
                const active = isActive(it.href);
                return (
                  <button
                    key={it.href}
                    onClick={() => {
                      onMobileClose?.();
                      router.push(it.href);
                    }}
                    className={cn(
                      "group relative flex w-full items-center gap-[11px] rounded-[7px] px-[11px] py-2 text-left text-[13.5px] font-medium transition-colors",
                      active
                        ? "bg-[#ffffff0d] text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
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
                    <span className="flex-1">{it.label}</span>
                    <span className="flex items-center gap-0.5 text-[11px] font-semibold text-[#6e6e6e] opacity-60 transition-all group-hover:text-[var(--accent-soft)] group-hover:opacity-100">
                      Edytuj
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* FOOTER — użytkownik + kropka obecności + menu (profil/wyloguj) */}
      <div className="relative flex items-center gap-[10px] border-t border-[var(--border-subtle)] p-[11px]">
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
          <div className="absolute -bottom-[1px] -right-[1px] h-[11px] w-[11px] rounded-full border-2 border-[var(--bg-card)] bg-[var(--green)]" />
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`/profil/${userId}`}
            onClick={onMobileClose}
            className="block truncate text-[13px] font-semibold text-[var(--text-primary)] hover:text-[var(--accent-soft)]"
          >
            {username || "Użytkownik"}
          </Link>
          <div className="mt-0.5">
            <span
              className={
                role === "ADMIN"
                  ? "inline-block rounded bg-[#9d6bff1a] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--accent-soft)]"
                  : "inline-block rounded bg-[#5b8def1a] px-1.5 py-0.5 text-[10px] font-semibold text-[#a8c4ff]"
              }
            >
              {role === "ADMIN" ? "Instruktor" : "Kursant"}
            </span>
          </div>
        </div>
        <button
          onClick={() => setProfileMenu((o) => !o)}
          title="Ustawienia"
          className="flex h-[30px] w-[30px] items-center justify-center rounded-[6px] text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>

        {profileMenu && (
          <div className="absolute bottom-[52px] right-[11px] z-50 w-[180px] overflow-hidden rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-xl">
            <Link
              href={`/profil/${userId}`}
              onClick={() => {
                setProfileMenu(false);
                onMobileClose?.();
              }}
              className="flex items-center gap-2 px-3 py-2 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            >
              <UserCircle className="h-4 w-4" />
              Mój profil
            </Link>
            <Link
              href="/profile"
              onClick={() => {
                setProfileMenu(false);
                onMobileClose?.();
              }}
              className="flex items-center gap-2 px-3 py-2 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Ustawienia
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-[#e07686] hover:bg-[var(--bg-elevated)]"
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
      <aside
        style={{ width }}
        className="relative hidden shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-card)] md:flex"
      >
        {content}
        {/* Uchwyt do zmiany szerokości (przeciąganie myszą) */}
        <div
          onMouseDown={startResize}
          title="Przeciągnij, aby zmienić szerokość"
          className="absolute right-0 top-0 z-10 h-full w-1 cursor-col-resize transition-colors hover:bg-[var(--accent)]"
        />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-hidden
          />
          <aside className="relative z-10 flex h-full w-[248px] max-w-[80vw] flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-card)]">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
