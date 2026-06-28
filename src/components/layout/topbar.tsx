"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LogOut,
  Users2,
  User as UserIcon,
  Shield,
  Menu,
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
    <div className="relative w-full max-w-[460px]">
      <div className="flex items-center gap-2 rounded-md border border-[#2e2e2e] bg-[#141414] px-3 py-2 focus-within:border-[var(--accent)]">
        <Search className="h-4 w-4 shrink-0 text-[#6e6e6e]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Szukaj lekcji, postów, użytkowników..."
          className="flex-1 bg-transparent text-[13.5px] text-text-primary outline-none placeholder:text-[#6e6e6e]"
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
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [messagesTarget, setMessagesTarget] = useState<{
    id: string;
    username: string | null;
    email: string;
    avatarUrl: string | null;
  } | null>(null);
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);

  // Heartbeat — aktualizuj lastActiveAt co 60 sekund
  useEffect(() => {
    async function beat() {
      try { await fetch("/api/heartbeat", { method: "POST" }); } catch { /* ignore */ }
    }
    void beat();
    const id = setInterval(beat, 60000);
    return () => clearInterval(id);
  }, []);

  // Panele otwierane z paska bocznego (custom events)
  useEffect(() => {
    function onOpenMessages(e: Event) {
      const detail = (e as CustomEvent).detail as
        | { id: string; username: string | null; email: string; avatarUrl: string | null }
        | undefined;
      setMessagesTarget(detail ?? null);
      setMessagesOpen(true);
    }
    function onOpenAnnouncements() {
      localStorage.setItem("announcements-last-seen", String(Date.now()));
      setAnnouncementsOpen(true);
    }
    window.addEventListener("open-messages", onOpenMessages);
    window.addEventListener("open-announcements", onOpenAnnouncements);
    return () => {
      window.removeEventListener("open-messages", onOpenMessages);
      window.removeEventListener("open-announcements", onOpenAnnouncements);
    };
  }, []);

  return (
    <>
      <header className="flex h-14 items-center gap-[18px] border-b border-[#2b2b2b] bg-[#1a1a1a] px-6">
        {/* Lewa strona: hamburger (mobile) */}
        <button
          type="button"
          aria-label="Otwórz menu"
          className="glow-icon-btn md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Wyszukiwarka */}
        <SearchBar />

        <div className="flex-1" />

        {/* Prawa strona: rola + avatar */}
        <div className="flex items-center gap-2">
          <Badge
            variant={role === "ADMIN" ? "default" : "secondary"}
            className="hidden sm:flex"
          >
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
                  <Link href="/admin/chapters"><Shield className="h-4 w-4" />Panel instruktora</Link>
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
