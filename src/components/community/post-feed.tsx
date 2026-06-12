"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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

  return (
    <div className="space-y-4">
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
    </div>
  );
}
