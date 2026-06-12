"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, MessageCircle, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AttachmentView } from "@/components/shared/attachment-view";
import { CommentForm } from "@/components/community/comment-form";
import { CommentTree } from "@/components/community/comment-tree";
import {
  authorInitials,
  authorName,
  type CommentItem,
  type PostItem,
} from "@/components/community/types";
import { timeAgo } from "@/lib/format-time";

export function PostCard({
  post,
  currentUserId,
  isAdmin,
  onDeleted,
}: {
  post: PostItem;
  currentUserId: string;
  isAdmin: boolean;
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

  const canDelete = post.authorId === currentUserId || isAdmin;

  async function handleDelete() {
    if (!confirm("Usunąć ten post?")) return;
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) onDeleted(post.id);
  }

  return (
    <article className="glow-card p-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          {post.author.avatarUrl && (
            <AvatarImage src={post.author.avatarUrl} alt={authorName(post.author)} />
          )}
          <AvatarFallback className="text-xs">
            {authorInitials(post.author)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <span className="text-sm font-medium text-text-primary">
            {authorName(post.author)}
          </span>
          <span className="text-text-muted"> · </span>
          <span className="text-xs text-text-muted">{timeAgo(post.createdAt)}</span>
        </div>
        {canDelete && (
          <button
            type="button"
            aria-label="Usuń post"
            className="ml-auto text-text-muted transition-colors hover:text-red-400"
            onClick={() => void handleDelete()}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {post.title && (
        <h3 className="mt-3 text-base font-semibold text-text-primary">
          {post.title}
        </h3>
      )}
      <p className="mt-2 whitespace-pre-wrap break-words text-sm text-text-secondary">
        {post.content}
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
