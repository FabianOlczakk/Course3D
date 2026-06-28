"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LogOut,
  MessageSquare,
  Users2,
  User as UserIcon,
  Shield,
  Menu,
  Megaphone,
  Search,
  X,
  BookOpen,
  FileText,
  Loader2,
} from "lucide-react";
import { MessagesPanel } from "@/components/messages/messages-panel";
import { AnnouncementsPanel } from "@/components/announcements/announcements-panel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Role } from "@prisma/client";

interface SearchResult {
  type: "lesson" | "post" | "wiki";
  id: string;
  title: string;
  description: string;
  url: string;
}

interface SearchResults {
  lessons: SearchResult[];
  posts: SearchResult[];
  wiki: SearchResult[];
}

function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void search(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  const allResults = results
    ? [...(results.lessons ?? []), ...(results.wiki ?? []), ...(results.posts ?? [])]
    : [];

  const typeIcon = (type: SearchResult["type"]) => {
    if (type === "lesson") return <BookOpen className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />;
    if (type === "wiki") return <FileText className="h-3.5 w-3.5 shrink-0 text-blue-400" />;
    return <Users2 className="h-3.5 w-3.5 shrink-0 text-text-muted" />;
  };

  const typeLabel = (type: SearchResult["type"]) => {
    if (type === "lesson") return "Lekcja";
    if (type === "wiki") return "Wiki";
    return "Post";
  };

  return (
    <div className="relative w-full max-w-xs">
      <div className="flex items-center gap-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)] px-3 py-1.5 focus-within:border-[var(--border-glow)]">
        <Search className="h-3.5 w-3.5 shrink-0 text-text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Szukaj w kursie..."
          className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-text-muted" />}
        {query && !loading && (
          <button type="button" onClick={() => { setQuery(""); setResults(null); inputRef.current?.focus(); }}>
            <X className="h-3.5 w-3.5 text-text-muted hover:text-text-primary" />
          </button>
        )}
      </div>

      {open && query.length >= 2 && (
        <div className="glow-card absolute left-0 top-full z-50 mt-1 w-full min-w-[320px] overflow-hidden rounded-lg p-0 shadow-xl">
          {allResults.length === 0 && !loading && (
            <p className="px-4 py-3 text-sm text-text-muted">Brak wyników dla „{query}"</p>
          )}
          {allResults.length > 0 && (
            <ul className="divide-y divide-[var(--border-subtle)]">
              {allResults.map((r) => (
                <li key={`${r.type}-${r.id}`}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-[var(--bg-elevated)] transition-colors"
                    onClick={() => { router.push(r.url); setOpen(false); setQuery(""); }}
                  >
                    {typeIcon(r.type)}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text-primary">{r.title}</p>
                      <p className="text-xs text-text-muted">{typeLabel(r.type)} · {r.description}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

interface TopbarProps {
  username: string | null;
  email: string;
  role: Role;
  avatarUrl?: string | null;
  onMenuClick?: () => void;
}

export function Topbar({
  username,
  email,
  role,
  avatarUrl,
  onMenuClick,
}: TopbarProps) {
  const initials = (username || email).slice(0, 2).toUpperCase();
  const router = useRouter();
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [messagesTarget, setMessagesTarget] = useState<{
    id: string;
    username: string | null;
    email: string;
    avatarUrl: string | null;
  } | null>(null);
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [annUnread, setAnnUnread] = useState(0);

  // Heartbeat — aktualizuj lastActiveAt co 60 sekund
  useEffect(() => {
    async function beat() {
      try { await fetch("/api/heartbeat", { method: "POST" }); } catch { /* ignore */ }
    }
    void beat();
    const id = setInterval(beat, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function onOpen(e: Event) {
      const detail = (e as CustomEvent).detail as
        | { id: string; username: string | null; email: string; avatarUrl: string | null }
        | undefined;
      setMessagesTarget(detail ?? null);
      setMessagesOpen(true);
    }
    window.addEventListener("open-messages", onOpen);
    return () => window.removeEventListener("open-messages", onOpen);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadAnn() {
      try {
        const res = await fetch("/api/announcements");
        if (!res.ok) return;
        const data = await res.json();
        const list: { createdAt: string }[] = data.announcements ?? [];
        const lastSeen = Number(localStorage.getItem("announcements-last-seen") || 0);
        const count = list.filter((a) => new Date(a.createdAt).getTime() > lastSeen).length;
        if (!cancelled) setAnnUnread(count);
      } catch { /* ignore */ }
    }
    void loadAnn();
    const id = setInterval(loadAnn, 30000);
    return () => { cancelled = true; clearInterval(id); };
  }, [announcementsOpen]);

  function openAnnouncements() {
    localStorage.setItem("announcements-last-seen", String(Date.now()));
    setAnnUnread(0);
    setAnnouncementsOpen(true);
  }

  useEffect(() => {
    let cancelled = false;
    async function loadUnread() {
      try {
        const res = await fetch("/api/messages/unread-count");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setUnread(data.count ?? 0);
      } catch { /* ignore */ }
    }
    void loadUnread();
    const id = setInterval(loadUnread, 10000);
    return () => { cancelled = true; clearInterval(id); };
  }, [messagesOpen]);

  return (
    <>
      <header className="flex h-16 items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-4">
        {/* Lewa strona: hamburger (mobile) */}
        <div className="flex items-center gap-2 md:hidden">
          <button type="button" aria-label="Otwórz menu" className="glow-icon-btn" onClick={onMenuClick}>
            <Menu className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-semibold text-text-primary">Course3D</h1>
        </div>
        <div className="hidden md:block" />

        {/* Środek: wyszukiwarka */}
        <div className="flex flex-1 justify-center">
          <SearchBar />
        </div>

        {/* Prawa strona: akcje + avatar */}
        <div className="flex items-center gap-1.5">
          <button type="button" title="Wiadomości" aria-label="Wiadomości" className="glow-icon-btn relative" onClick={() => setMessagesOpen(true)}>
            <MessageSquare className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </button>
          <button type="button" title="Ogłoszenia" aria-label="Ogłoszenia" className="glow-icon-btn relative" onClick={openAnnouncements}>
            <Megaphone className="h-4 w-4" />
            {annUnread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-semibold text-white">
                {annUnread > 99 ? "99+" : annUnread}
              </span>
            )}
          </button>
          <button type="button" title="Społeczność" aria-label="Społeczność" className="glow-icon-btn" onClick={() => router.push("/spolecznosc")}>
            <Users2 className="h-4 w-4" />
          </button>

          <Badge variant={role === "ADMIN" ? "default" : "secondary"} className="ml-1 hidden sm:flex">
            {role === "ADMIN" ? "Instruktor" : "Kursant"}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar>
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={email} />}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{username || "Użytkownik"}</span>
                  <span className="text-xs font-normal text-muted-foreground">{email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile"><UserIcon className="h-4 w-4" />Profil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/wiki"><FileText className="h-4 w-4" />Wiki</Link>
              </DropdownMenuItem>
              {role === "ADMIN" && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/chapters"><Shield className="h-4 w-4" />Panel admina</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                <LogOut className="h-4 w-4" />Wyloguj się
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <MessagesPanel
        open={messagesOpen}
        onClose={() => { setMessagesOpen(false); setMessagesTarget(null); }}
        initialUser={messagesTarget}
      />
      <AnnouncementsPanel open={announcementsOpen} onClose={() => setAnnouncementsOpen(false)} />
    </>
  );
}
