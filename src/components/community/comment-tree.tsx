"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowBigDown, ArrowBigUp, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AttachmentView } from "@/components/shared/attachment-view";
import { AdminBadge } from "@/components/shared/admin-badge";
import { CommentForm } from "@/components/community/comment-form";
import { MentionText } from "@/components/community/mention-text";
import {
  authorInitials,
  authorName,
  type CommentItem,
} from "@/components/community/types";
import { timeAgo } from "@/lib/format-time";
import { OnlineDot } from "@/components/shared/online-dot";
import { CopyLinkButton } from "@/components/shared/copy-link-button";

const MAX_INDENT = 4;

interface TreeNode extends CommentItem {
  children: TreeNode[];
}

// Buduje drzewo komentarzy z płaskiej listy (po parentId).
function buildTree(comments: CommentItem[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];
  for (const c of comments) map.set(c.id, { ...c, children: [] });
  for (const c of comments) {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export function CommentTree({
  postId,
  comments,
  currentUserId,
  isAdmin,
  onChange,
}: {
  postId: string;
  comments: CommentItem[];
  currentUserId: string;
  isAdmin: boolean;
  onChange: () => void;
}) {
  const tree = useMemo(() => buildTree(comments), [comments]);
  return (
    <div className="space-y-3">
      {tree.map((node) => (
        <CommentNode
          key={node.id}
          node={node}
          depth={0}
          postId={postId}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onChange={onChange}
        />
      ))}
    </div>
  );
}

function CommentNode({
  node,
  depth,
  postId,
  currentUserId,
  isAdmin,
  onChange,
}: {
  node: TreeNode;
  depth: number;
  postId: string;
  currentUserId: string;
  isAdmin: boolean;
  onChange: () => void;
}) {
  const [replying, setReplying] = useState(false);
  const canDelete = node.authorId === currentUserId || isAdmin;
  const indent = Math.min(depth, MAX_INDENT);

  const [voteUp, setVoteUp] = useState(node.votes?.up ?? 0);
  const [voteDown, setVoteDown] = useState(node.votes?.down ?? 0);
  const [myVote, setMyVote] = useState<"UP" | "DOWN" | null>(node.votes?.myVote ?? null);
  const [voting, setVoting] = useState(false);
  const score = voteUp - voteDown;

  async function handleDelete() {
    if (!confirm("Usunąć ten komentarz?")) return;
    const res = await fetch(`/api/comments/${node.id}`, { method: "DELETE" });
    if (res.ok) onChange();
  }

  async function handleVote(value: "UP" | "DOWN") {
    if (voting) return;
    setVoting(true);
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
      const res = await fetch(`/api/comments/${node.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (res.ok) {
        const d = await res.json();
        setVoteUp(d.up); setVoteDown(d.down); setMyVote(d.myVote);
      } else {
        setVoteUp(prevUp); setVoteDown(prevDown); setMyVote(prevMy);
      }
    } catch {
      setVoteUp(prevUp); setVoteDown(prevDown); setMyVote(prevMy);
    } finally {
      setVoting(false);
    }
  }

  return (
    <div
      id={`comment-${node.id}`}
      className="border-l border-[var(--border-subtle)] pl-3"
      style={{ marginLeft: indent > 0 ? `${indent * 0.5}rem` : 0 }}
    >
      <div className="flex items-start gap-2">
        <Link href={`/profil/${node.author.id}`} className="relative shrink-0">
          <Avatar className="h-7 w-7">
            {node.author.avatarUrl && (
              <AvatarImage src={node.author.avatarUrl} alt={authorName(node.author)} />
            )}
            <AvatarFallback className="text-[10px]">
              {authorInitials(node.author)}
            </AvatarFallback>
          </Avatar>
          <OnlineDot
            lastActiveAt={node.author.lastActiveAt}
            className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 border-2 border-[#1e1e1e]"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/profil/${node.author.id}`}
              className="flex items-center gap-1 text-sm font-medium text-text-primary hover:text-[var(--accent)] hover:underline"
            >
              {authorName(node.author)}
            </Link>
            <AdminBadge role={node.author.role} />
            <span className="text-xs text-text-muted">
              {timeAgo(node.createdAt)}
            </span>
            <div className="ml-auto flex items-center gap-2">
              {isAdmin && (
                <CopyLinkButton
                  path={`/spolecznosc?post=${postId}&comment=${node.id}`}
                  className="text-text-muted transition-colors hover:text-[var(--accent-soft)]"
                />
              )}
              {canDelete && (
                <button
                  type="button"
                  aria-label="Usuń komentarz"
                  className="text-text-muted transition-colors hover:text-red-400"
                  onClick={() => void handleDelete()}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="whitespace-pre-wrap break-words text-sm text-text-secondary">
            <MentionText content={node.content} mentions={node.mentions} />
          </div>
          {node.attachments && <AttachmentView attachments={node.attachments} />}
          <div className="mt-1 flex items-center gap-3">
            {/* Głosy komentarza (like / dislike) */}
            <div className="flex items-center gap-1">
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
                <ArrowBigUp className="h-4 w-4" fill={myVote === "UP" ? "currentColor" : "none"} />
              </button>
              <span
                className={`min-w-[1ch] text-center text-[11px] font-bold tabular-nums ${
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
                <ArrowBigDown className="h-4 w-4" fill={myVote === "DOWN" ? "currentColor" : "none"} />
              </button>
            </div>
            <button
              type="button"
              className="text-xs font-medium text-[var(--accent)] hover:underline"
              onClick={() => setReplying((r) => !r)}
            >
              Odpowiedz
            </button>
          </div>
          {replying && (
            <CommentForm
              postId={postId}
              parentId={node.id}
              mention={authorName(node.author)}
              autoFocus
              onCreated={onChange}
              onCancel={() => setReplying(false)}
            />
          )}
        </div>
      </div>

      {node.children.length > 0 && (
        <div className="mt-3 space-y-3">
          {node.children.map((child) => (
            <CommentNode
              key={child.id}
              node={child}
              depth={depth + 1}
              postId={postId}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onChange={onChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
