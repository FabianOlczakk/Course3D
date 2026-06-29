"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, MessageCircle, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AttachmentView } from "@/components/shared/attachment-view";
import { AdminBadge } from "@/components/shared/admin-badge";
import { Highlight } from "@/components/shared/highlight";
import { CommentForm } from "@/components/community/comment-form";
import { CommentTree } from "@/components/community/comment-tree";
import {
  authorInitials,
  authorName,
  type CommentItem,
  type PostItem,
} from "@/components/community/types";
import { timeAgo } from "@/lib/format-time";
import { OnlineDot } from "@/components/shared/online-dot";
import { CopyLinkButton } from "@/components/shared/copy-link-button";

export function PostCard({
  post,
  currentUserId,
  isAdmin,
  highlight,
  onDeleted,
}: {
  post: PostItem;
  currentUserId: string;
  isAdmin: boolean;
  highlight?: string;
  onDeleted: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(post._count.comments);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments ?? []);
        setCount((data.comments ?? []).length);
      }
    } finally {
      setLoading(false);
    }
  }, [post.id]);

  useEffect(() => {
    if (expanded) void loadComments();
  }, [expanded, loadComments]);

  // Bezpośredni link do komentarza — rozwiń ten post automatycznie.
  const searchParams = useSearchParams();
  useEffect(() => {
    if (
      searchParams.get("comment") &&
      searchParams.get("post") === post.id
    ) {
      setExpanded(true);
    }
  }, [searchParams, post.id]);

  const canDelete = post.authorId === currentUserId || isAdmin;

  async function handleDelete() {
    if (!confirm("Usunąć ten post?")) return;
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) onDeleted(post.id);
  }

  return (
    <article id={`post-${post.id}`} className="glow-card p-4">
      <div className="flex items-center gap-3">
        <Link href={`/profil/${post.author.id}`} className="relative shrink-0">
          <Avatar className="h-9 w-9">
            {post.author.avatarUrl && (
              <AvatarImage src={post.author.avatarUrl} alt={authorName(post.author)} />
            )}
            <AvatarFallback className="text-xs">
              {authorInitials(post.author)}
            </AvatarFallback>
          </Avatar>
          <OnlineDot
            lastActiveAt={post.author.lastActiveAt}
            className="absolute -bottom-0.5 -right-0.5 h-3 w-3 border-2 border-[#1e1e1e]"
          />
        </Link>
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <Link
            href={`/profil/${post.author.id}`}
            className="flex items-center gap-1.5 text-sm font-medium text-text-primary hover:text-[var(--accent)] hover:underline"
          >
            {authorName(post.author)}
          </Link>
          <AdminBadge role={post.author.role} />
          <span className="text-text-muted">·</span>
          <span className="text-xs text-text-muted">{timeAgo(post.createdAt)}</span>
          {post.category && (
            <span
              className="rounded-[5px] px-2 py-0.5 text-[10.5px] font-semibold"
              style={{
                background: (post.category.color || "#9d6bff") + "1a",
                color: post.category.color || "var(--accent-soft)",
              }}
            >
              {post.category.name}
            </span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {isAdmin && <CopyLinkButton path={`/spolecznosc/${post.id}`} />}
          {canDelete && (
            <button
              type="button"
              aria-label="Usuń post"
              className="text-text-muted transition-colors hover:text-red-400"
              onClick={() => void handleDelete()}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {post.title && (
        <h3 className="mt-3 text-base font-semibold text-text-primary">
          <Highlight text={post.title} query={highlight} />
        </h3>
      )}
      <p className="mt-2 whitespace-pre-wrap break-words text-sm text-text-secondary">
        <Highlight text={post.content} query={highlight} />
      </p>
      {post.attachments && <AttachmentView attachments={post.attachments} />}

      <button
        type="button"
        className="mt-3 flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-[var(--accent)]"
        onClick={() => setExpanded((e) => !e)}
      >
        <MessageCircle className="h-4 w-4" />
        {count} {count === 1 ? "komentarz" : "komentarzy"}
      </button>

      {expanded && (
        <div className="mt-3 border-t border-[var(--border-subtle)] pt-3">
          <CommentForm postId={post.id} onCreated={loadComments} />
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
            </div>
          ) : (
            <div className="mt-3">
              <CommentTree
                postId={post.id}
                comments={comments}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onChange={loadComments}
              />
            </div>
          )}
        </div>
      )}
    </article>
  );
}
