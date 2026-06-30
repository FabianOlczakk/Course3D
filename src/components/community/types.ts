import type { Attachment } from "@/lib/attachments-client";
import type { Role } from "@prisma/client";

export interface AuthorMini {
  id: string;
  username: string | null;
  email: string;
  avatarUrl: string | null;
  role?: Role;
  lastActiveAt?: string | Date | null;
}

export interface CategoryMini {
  id: string;
  name: string;
  color: string | null;
}

export interface PostItem {
  id: string;
  authorId: string;
  title: string | null;
  content: string;
  attachments: Attachment[] | null;
  createdAt: string;
  author: AuthorMini;
  category?: CategoryMini | null;
  _count: { comments: number };
  votes?: { up: number; down: number; myVote: "UP" | "DOWN" | null };
}

export interface CommentItem {
  id: string;
  authorId: string;
  postId: string;
  parentId: string | null;
  content: string;
  attachments: Attachment[] | null;
  createdAt: string;
  author: AuthorMini;
  votes?: { up: number; down: number; myVote: "UP" | "DOWN" | null };
}

export function authorName(a: AuthorMini): string {
  return a.username || a.email;
}

export function authorInitials(a: AuthorMini): string {
  return (a.username || a.email).slice(0, 2).toUpperCase();
}
