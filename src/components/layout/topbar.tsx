"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Users2, Menu, Search, X, BookOpen, FileText, Loader2 } from "lucide-react";
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
  const [filter, setFilter] = useState<"all" | "lesson" | "post" | "wiki">("all");
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

  const allResults = (
    results
      ? [...(results.lessons ?? []), ...(results.wiki ?? []), ...(results.posts ?? [])]
      : []
  ).filter((r) => filter === "all" || r.type === filter);

  const FILTERS: { key: "all" | "lesson" | "post" | "wiki"; label: string }[] = [
    { key: "all", label: "Wszystko" },
    { key: "lesson", label: "Lekcje" },
    { key: "post", label: "Posty" },
    { key: "wiki", label: "Wiki" },
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
    <header className="relative flex h-14 items-center justify-center border-b border-[#2b2b2b] bg-[#1a1a1a] px-6">
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

      {/* Plakietka roli — przy prawej krawędzi */}
      <span
        className={
          "absolute right-6 hidden sm:block rounded-md px-3 py-1.5 text-[12.5px] font-semibold " +
          (role === "ADMIN"
            ? "bg-[#9d6bff1a] text-[var(--accent-soft)]"
            : "bg-[#5b8def1a] text-[#a8c4ff]")
        }
      >
        {role === "ADMIN" ? "Instruktor" : "Kursant"}
      </span>
    </header>
  );
}
