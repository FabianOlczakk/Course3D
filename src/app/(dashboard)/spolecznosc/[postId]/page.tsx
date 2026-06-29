import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PostDetailClient } from "@/components/community/post-detail-client";

export async function generateMetadata({
  params,
}: {
  params: { postId: string };
}): Promise<Metadata> {
  const post = await prisma.post.findUnique({
    where: { id: params.postId },
    select: { title: true, content: true },
  });
  const title = post?.title ?? post?.content?.slice(0, 60) ?? "Post";
  return { title: `${title} — Społeczność` };
}

export default async function PostDetailPage({
  params,
}: {
  params: { postId: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const post = await prisma.post.findUnique({
    where: { id: params.postId },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
          role: true,
          lastActiveAt: true,
        },
      },
      category: { select: { id: true, name: true, color: true } },
      _count: { select: { comments: true } },
    },
  });

  if (!post) notFound();

  const isAdmin = session.user.role === "ADMIN";

  const postItem = {
    id: post.id,
    authorId: post.authorId,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt.toISOString(),
    author: {
      id: post.author.id,
      username: post.author.username,
      email: post.author.email,
      avatarUrl: post.author.avatarUrl,
      role: post.author.role,
      lastActiveAt: post.author.lastActiveAt?.toISOString() ?? null,
    },
    category: post.category,
    attachments: post.attachments as { name: string; url: string; type: string; size: number }[] | null,
    _count: post._count,
  };

  return (
    <div className="mx-auto max-w-[740px] p-[26px] md:px-[30px]">
      <Link
        href="/spolecznosc"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Społeczność
      </Link>

      <PostDetailClient
        post={postItem}
        currentUserId={session.user.id}
        isAdmin={isAdmin}
      />
    </div>
  );
}
