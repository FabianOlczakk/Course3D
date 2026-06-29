"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Search, X, Plus, Trash2 } from "lucide-react";
import { NewPostForm } from "@/components/community/new-post-form";
import { PostCard } from "@/components/community/post-card";
import type { CategoryMini, PostItem } from "@/components/community/types";

// Feed postów z paginacją kursorową.
export function PostFeed({
  currentUserId,
  isAdmin,
}: {
  currentUserId: string;
  isAdmin: boolean;
}) {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const [query, setQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState<PostItem[]>([]);
  const [searching, setSearching] = useState(false);

  const [categories, setCategories] = useState<CategoryMini[]>([]);
  const [activeCat, setActiveCat] = useState("");
  const [managing, setManaging] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#9d6bff");

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories?type=POST");
      if (res.ok) setCategories((await res.json()).categories ?? []);
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  async function addCategory() {
    const name = newCatName.trim();
    if (!name) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color: newCatColor, type: "POST" }),
    });
    if (res.ok) {
      setNewCatName("");
      void loadCategories();
    }
  }
  async function deleteCategory(id: string) {
    if (!confirm("Usunąć kategorię?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (activeCat === id) setActiveCat("");
      void loadCategories();
    }
  }

  const shownPosts = activeCat
    ? posts.filter((p) => p.category?.id === activeCat)
    : posts;

  const loadMore = useCallback(
    async (reset = false) => {
      setLoading(true);
      try {
        const c = reset ? null : cursor;
        const url = `/api/posts?limit=10${c ? `&cursor=${c}` : ""}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const newPosts: PostItem[] = data.posts ?? [];
          setPosts((prev) => (reset ? newPosts : [...prev, ...newPosts]));
          setCursor(data.nextCursor);
          setHasMore(Boolean(data.nextCursor));
        }
      } finally {
        setLoading(false);
        setInitialLoaded(true);
      }
    },
    [cursor]
  );

  useEffect(() => {
    void loadMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bezpośredni link do posta (?post=ID) — dociągnij, jeśli nie jest na liście.
  const searchParams = useSearchParams();
  useEffect(() => {
    const target = searchParams.get("post");
    if (!target) return;
    setPosts((prev) => {
      if (prev.some((p) => p.id === target)) return prev;
      void (async () => {
        try {
          const res = await fetch(`/api/posts/${target}`);
          if (res.ok) {
            const d = await res.json();
            if (d.post) setPosts((cur) => [d.post, ...cur.filter((p) => p.id !== target)]);
          }
        } catch {
          /* ignore */
        }
      })();
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Wyszukiwanie z debounce.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setSearchActive(false);
      setSearchResults([]);
      return;
    }
    setSearchActive(true);
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/posts/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.posts ?? []);
        }
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="space-y-4">
      {/* Pasek wyszukiwania */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Szukaj w postach i komentarzach..."
          className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-2.5 pl-9 pr-9 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {query && (
          <button
            type="button"
            aria-label="Wyczyść"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            onClick={() => setQuery("")}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {searchActive ? (
        <div className="space-y-4">
          {searching ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
            </div>
          ) : searchResults.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">
              Brak wyników dla „{query}”.
            </p>
          ) : (
            searchResults.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                highlight={query}
                onDeleted={(id) =>
                  setSearchResults((prev) => prev.filter((p) => p.id !== id))
                }
              />
            ))
          )}
        </div>
      ) : (
        <>
      {/* Zakładki kategorii */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveCat("")}
          className={
            activeCat === ""
              ? "rounded-md bg-[#9d6bff1a] px-3 py-1.5 text-[12.5px] font-semibold text-[var(--accent-soft)]"
              : "rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-[12.5px] font-semibold text-text-secondary hover:text-text-primary"
          }
        >
          Wszystko
        </button>
        {categories.map((c) => (
          <span key={c.id} className="flex items-center">
            <button
              onClick={() => setActiveCat(c.id)}
              className={
                activeCat === c.id
                  ? "rounded-md px-3 py-1.5 text-[12.5px] font-semibold"
                  : "rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-[12.5px] font-semibold text-text-secondary hover:text-text-primary"
              }
              style={
                activeCat === c.id
                  ? { background: (c.color || "#9d6bff") + "1a", color: c.color || "#b89dff" }
                  : undefined
              }
            >
              {c.name}
            </button>
            {isAdmin && managing && (
              <button
                onClick={() => void deleteCategory(c.id)}
                aria-label="Usuń kategorię"
                className="ml-1 text-text-muted hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </span>
        ))}
        {isAdmin && (
          <button
            onClick={() => setManaging((m) => !m)}
            className="rounded-md border border-[var(--border-subtle)] px-3 py-1.5 text-[12.5px] font-semibold text-text-secondary hover:text-text-primary"
          >
            {managing ? "Gotowe" : "Zarządzaj"}
          </button>
        )}
      </div>

      {isAdmin && managing && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
          <input
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Nazwa nowej kategorii"
            className="flex-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-text-primary outline-none"
          />
          <input
            type="color"
            value={newCatColor}
            onChange={(e) => setNewCatColor(e.target.value)}
            className="h-9 w-12 cursor-pointer rounded-md border border-[var(--border-subtle)] bg-transparent p-1 [&::-moz-color-swatch]:rounded [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
          />
          <button
            onClick={() => void addCategory()}
            className="glow-btn flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" /> Dodaj
          </button>
        </div>
      )}

      <NewPostForm onCreated={(p) => setPosts((prev) => [p, ...prev])} />

      {shownPosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
        />
      ))}

      {initialLoaded && posts.length === 0 && (
        <p className="py-8 text-center text-sm text-text-muted">
          Brak postów. Bądź pierwszy!
        </p>
      )}

      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
        </div>
      )}

      {!loading && hasMore && posts.length > 0 && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            className="glow-card rounded-md px-6 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Załaduj więcej
          </button>
        </div>
      )}
        </>
      )}
    </div>
  );
}
