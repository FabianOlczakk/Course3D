"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowBigUp, ArrowBigDown, ChevronRight,
  Loader2, MessageCircle, Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AttachmentView } from "@/components/shared/attachment-view";
import { AdminBadge } from "@/components/shared/admin-badge";
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

// Parsuje @username w treści i linkuje do profilu
function renderMentions(text: string) {
  const parts = text.split(/(@[\w.]+)/g);
  return parts.map((part, i) => {
    if (/^@[\w.]+$/.test(part)) {
      return (
        <Link
          key={i}
          href={`/spolecznosc?search=${encodeURIComponent(part)}`}
          className="font-medium text-[var(--accent)] hover:underline"
        >
          {part}
        </Link>
      );
    }
    return part;
  });
}

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
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [count, setCount] = useState(post._count.comments);

  const [voteUp, setVoteUp] = useState(post.votes?.up ?? 0);
  const [voteDown, setVoteDown] = useState(post.votes?.down ?? 0);
  const [myVote, setMyVote] = useState<"UP" | "DOWN" | null>(post.votes?.myVote ?? null);
  const [voting, setVoting] = useState(false);

  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadComments = useCallback(async () => {
    setCommentsLoading(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments ?? []);
        setCount((data.comments ?? []).length);
      }
    } finally {
      setCommentsLoading(false);
    }
  }, [post.id]);

  // Auto-refresh komentarzy co 20s kiedy są otwarte
  useEffect(() => {
    if (expanded) {
      void loadComments();
      autoRefreshRef.current = setInterval(() => void loadComments(), 20000);
    } else {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    }
    return () => { if (autoRefreshRef.current) clearInterval(autoRefreshRef.current); };
  }, [expanded, loadComments]);

  // Rozwiń jeśli URL ma ?post=...&comment=...
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("comment") && searchParams.get("post") === post.id) {
      setExpanded(true);
    }
  }, [searchParams, post.id]);

  const canDelete = post.authorId === currentUserId || isAdmin;

  async function handleDelete() {
    if (!confirm("Usunąć ten post?")) return;
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) onDeleted(post.id);
  }

  async function handleVote(value: "UP" | "DOWN") {
    if (voting) return;
    setVoting(true);
    // Optymistyczna aktualizacja
    const prevUp = voteUp, prevDown = voteDown, prevMy = myVote;
    if (myVote === value) {
      setMyVote(null);
      value === "UP" ? setVoteUp((v) => v - 1) : setVoteDown((v) => v - 1);
    } else {
      if (myVote === "UP") setVoteUp((v) => v - 1);
      if (myVote === "DOWN") setVoteDown((v) => v - 1);
      setMyVote(value);
      value === "UP" ? setVoteUp((v) => v + 1) : setVoteDown((v) => v + 1);
    }
    try {
      const res = await fetch(`/api/posts/${post.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (res.ok) {
        const data = await res.json();
        setVoteUp(data.up);
        setVoteDown(data.down);
        setMyVote(data.myVote);
      } else {
        setVoteUp(prevUp); setVoteDown(prevDown); setMyVote(prevMy);
      }
    } catch {
      setVoteUp(prevUp); setVoteDown(prevDown); setMyVote(prevMy);
    } finally {
      setVoting(false);
    }
  }

  const score = voteUp - voteDown;

  return (
    <article id={`post-${post.id}`} className="glow-card overflow-hidden">
      <div className="flex gap-0">
        {/* Kolumna głosowania — lewa */}
        <div className="flex w-10 shrink-0 flex-col items-center gap-0.5 bg-[var(--bg-elevated)] px-1 py-3">
          <button
            type="button"
            aria-label="Głosuj w górę"
            disabled={voting}
            onClick={() => void handleVote("UP")}
            className={`rounded-[4px] p-0.5 transition-colors disabled:opacity-50 ${
              myVote === "UP"
                ? "text-orange-400"
                : "text-[var(--text-muted)] hover:text-orange-400"
            }`}
          >
            <ArrowBigUp className="h-5 w-5" fill={myVote === "UP" ? "currentColor" : "none"} />
          </button>
          <span
            className={`text-[12px] font-bold tabular-nums leading-none ${
              score > 0 ? "text-orange-400" : score < 0 ? "text-blue-400" : "text-[var(--text-muted)]"
            }`}
          >
            {score}
          </span>
          <button
            type="button"
            aria-label="Głosuj w dół"
            disabled={voting}
            onClick={() => void handleVote("DOWN")}
            className={`rounded-[4px] p-0.5 transition-colors disabled:opacity-50 ${
              myVote === "DOWN"
                ? "text-blue-400"
                : "text-[var(--text-muted)] hover:text-blue-400"
            }`}
          >
            <ArrowBigDown className="h-5 w-5" fill={myVote === "DOWN" ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Treść główna */}
        <div className="min-w-0 flex-1 p-4">
          {/* Nagłówek */}
          <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[11.5px] text-[var(--text-muted)]">
            <Link href={`/profil/${post.author.id}`} className="relative shrink-0">
              <Avatar className="h-6 w-6">
                {post.author.avatarUrl && (
                  <AvatarImage src={post.author.avatarUrl} alt={authorName(post.author)} />
                )}
                <AvatarFallback className="text-[9px]">{authorInitials(post.author)}</AvatarFallback>
              </Avatar>
              <OnlineDot
                lastActiveAt={post.author.lastActiveAt}
                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 border border-[var(--bg-elevated)]"
              />
            </Link>
            <Link
              href={`/profil/${post.author.id}`}
              className="font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] hover:underline"
            >
              {authorName(post.author)}
            </Link>
            <AdminBadge role={post.author.role} />
            <span>·</span>
            <span>{timeAgo(post.createdAt)}</span>
            {post.category && (
              <span
                className="rounded-[4px] px-1.5 py-[1px] text-[10px] font-semibold"
                style={{
                  background: (post.category.color || "#9d6bff") + "1a",
                  color: post.category.color || "var(--accent-soft)",
                }}
              >
                {post.category.name}
              </span>
            )}
            <div className="ml-auto flex items-center gap-1.5">
              {isAdmin && <CopyLinkButton path={`/spolecznosc/${post.id}`} />}
              <Link
                href={`/spolecznosc/${post.id}`}
                aria-label="Otwórz post"
                className="shrink-0 text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
              {canDelete && (
                <button
                  type="button"
                  aria-label="Usuń post"
                  className="text-[var(--text-muted)] transition-colors hover:text-red-400"
                  onClick={() => void handleDelete()}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Tytuł */}
          {post.title && (
            <h3 className="mb-1.5 font-display text-[15px] font-semibold leading-snug text-[var(--text-primary)]">
              {highlight
                ? post.title
                : post.title}
            </h3>
          )}

          {/* Treść */}
          <div className="whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-[var(--text-secondary)]">
            {renderMentions(post.content)}
          </div>

          {post.attachments && <AttachmentView attachments={post.attachments} />}

          {/* Stopka */}
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-[5px] px-2 py-1 text-[12px] font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              onClick={() => setExpanded((e) => !e)}
            >
              <MessageCircle className="h-4 w-4" />
              {count} {count === 1 ? "komentarz" : count < 5 ? "komentarze" : "komentarzy"}
            </button>
          </div>

          {expanded && (
            <div className="mt-3 border-t border-[var(--border-subtle)] pt-3">
              <CommentForm postId={post.id} onCreated={loadComments} />
              {commentsLoading && comments.length === 0 ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--text-muted)]" />
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
        </div>
      </div>
    </article>
  );
}
