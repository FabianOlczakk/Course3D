"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Users2, Menu, Search, X, BookOpen, FileText, Loader2, MessageSquare, Sun, Moon, Monitor } from "lucide-react";
import type { Role } from "@prisma/client";
import { useTheme, type Theme } from "@/components/theme-provider";

interface SearchResult {
  type: "lesson" | "post" | "wiki";
  id: string;
  title: string;
  description: string;
  url: string;
}

interface UserResult {
  id: string;
  username: string | null;
  email: string;
  avatarUrl: string | null;
}

interface SearchResults {
  lessons: SearchResult[];
  posts: SearchResult[];
  wiki: SearchResult[];
}

type FilterKey = "all" | "lesson" | "post" | "wiki" | "user";

function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [users, setUsers] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); setUsers([]); return; }
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch(`/api/search?q=${encodeURIComponent(q)}`),
        fetch(`/api/users/search?q=${encodeURIComponent(q)}`),
      ]);
      if (r1.ok) setResults((await r1.json()).results);
      if (r2.ok) setUsers((await r2.json()).users ?? []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void search(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  const allResults = (
    results
      ? [...(results.lessons ?? []), ...(results.wiki ?? []), ...(results.posts ?? [])]
      : []
  ).filter((r) => filter === "all" || r.type === filter);
  const showUsers = filter === "all" || filter === "user";

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: "all", label: "Wszystko" },
    { key: "lesson", label: "Lekcje" },
    { key: "post", label: "Posty" },
    { key: "wiki", label: "Wiki" },
    { key: "user", label: "Użytkownicy" },
  ];

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
      <div className="flex items-center gap-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 focus-within:border-[var(--accent)]">
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
          {/* Filtry typu — pojawiają się po wpisaniu zapytania */}
          <div className="flex gap-1.5 border-b border-[var(--border-subtle)] p-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setFilter(f.key)}
                className={
                  filter === f.key
                    ? "rounded-md bg-[#9d6bff1a] px-2.5 py-1 text-xs font-semibold text-[var(--accent-soft)]"
                    : "rounded-md px-2.5 py-1 text-xs font-semibold text-text-secondary hover:bg-[var(--bg-elevated)]"
                }
              >
                {f.label}
              </button>
            ))}
          </div>
          {allResults.length === 0 && (!showUsers || users.length === 0) && !loading && (
            <p className="px-4 py-3 text-sm text-text-muted">Brak wyników dla „{query}"</p>
          )}
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
            {showUsers &&
              users.map((u) => {
                const name = u.username || u.email;
                return (
                  <li key={`user-${u.id}`} className="flex items-center gap-2 px-4 py-2">
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      onClick={() => { router.push(`/profil/${u.id}`); setOpen(false); setQuery(""); }}
                    >
                      {u.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.avatarUrl} alt={name} className="h-7 w-7 shrink-0 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-semibold text-white">
                          {name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-text-primary">{name}</p>
                        <p className="text-xs text-text-muted">Użytkownik</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      title="Wyślij wiadomość"
                      aria-label="Wyślij wiadomość"
                      className="shrink-0 rounded-md p-1.5 text-text-muted transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--accent-soft)]"
                      onClick={() => { router.push(`/wiadomosci?u=${u.id}`); setOpen(false); setQuery(""); }}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
          </ul>
        </div>
      )}
    </div>
  );
}

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const options: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: "light", icon: <Sun className="h-3.5 w-3.5" />, label: "Jasny" },
    { value: "dark", icon: <Moon className="h-3.5 w-3.5" />, label: "Ciemny" },
    { value: "system", icon: <Monitor className="h-3.5 w-3.5" />, label: "Systemowy" },
  ];

  const current = options.find((o) => o.value === theme) ?? options[1];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Zmień motyw"
        onClick={() => setOpen((o) => !o)}
        className="glow-icon-btn"
        title={current.label}
      >
        {current.icon}
      </button>
      {open && (
        <div className="glow-card absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden p-1 shadow-xl">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { setTheme(o.value); setOpen(false); }}
              className={
                "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[12.5px] text-left transition-colors " +
                (theme === o.value
                  ? "bg-[var(--accent-glow)] text-[var(--accent-soft)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]")
              }
            >
              {o.icon}
              {o.label}
            </button>
          ))}
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
  // Heartbeat — aktualizuj lastActiveAt co 60 sekund
  useEffect(() => {
    async function beat() {
      try { await fetch("/api/heartbeat", { method: "POST" }); } catch { /* ignore */ }
    }
    void beat();
    const id = setInterval(beat, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="relative flex h-14 items-center justify-center border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-6">
      {/* Hamburger (mobile) */}
      <button
        type="button"
        aria-label="Otwórz menu"
        className="glow-icon-btn absolute left-4 md:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Wyszukiwarka — wycentrowana */}
      <SearchBar />

      {/* Prawa strona: switcher motywu + plakietka roli */}
      <div className="absolute right-4 flex items-center gap-2 sm:right-6">
        <ThemeSwitcher />
        <span
          className={
            "hidden sm:block rounded-md px-3 py-1.5 text-[12.5px] font-semibold " +
            (role === "ADMIN"
              ? "bg-[#9d6bff1a] text-[var(--accent-soft)]"
              : "bg-[#5b8def1a] text-[#a8c4ff]")
          }
        >
          {role === "ADMIN" ? "Instruktor" : "Kursant"}
        </span>
      </div>
    </header>
  );
}
