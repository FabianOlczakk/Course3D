"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AttachmentView } from "@/components/shared/attachment-view";
import { AdminBadge } from "@/components/shared/admin-badge";
import { CommentForm } from "@/components/community/comment-form";
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

  async function handleDelete() {
    if (!confirm("Usunąć ten komentarz?")) return;
    const res = await fetch(`/api/comments/${node.id}`, { method: "DELETE" });
    if (res.ok) onChange();
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
          <p className="whitespace-pre-wrap break-words text-sm text-text-secondary">
            {node.content}
          </p>
          {node.attachments && <AttachmentView attachments={node.attachments} />}
          <button
            type="button"
            className="mt-1 text-xs font-medium text-[var(--accent)] hover:underline"
            onClick={() => setReplying((r) => !r)}
          >
            Odpowiedz
          </button>
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
