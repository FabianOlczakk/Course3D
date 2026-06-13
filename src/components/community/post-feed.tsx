"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { NewPostForm } from "@/components/community/new-post-form";
import { PostCard } from "@/components/community/post-card";
import type { PostItem } from "@/components/community/types";

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
      <NewPostForm onCreated={(p) => setPosts((prev) => [p, ...prev])} />

      {posts.map((post) => (
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
