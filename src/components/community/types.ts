import type { Attachment } from "@/lib/attachments-client";
import type { Role } from "@prisma/client";

export interface AuthorMini {
  id: string;
  username: string | null;
  email: string;
  avatarUrl: string | null;
  role?: Role;
}

export interface PostItem {
  id: string;
  authorId: string;
  title: string | null;
  content: string;
  attachments: Attachment[] | null;
  createdAt: string;
  author: AuthorMini;
  _count: { comments: number };
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
}

export function authorName(a: AuthorMini): string {
  return a.username || a.email;
}

export function authorInitials(a: AuthorMini): string {
  return (a.username || a.email).slice(0, 2).toUpperCase();
}
