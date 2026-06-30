import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PostDetailClient } from "@/components/community/post-detail-client";
import { attachMentions } from "@/lib/mentions";
import { maskActivity } from "@/lib/online-status";

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
          activityPrivate: true,
        },
      },
      category: { select: { id: true, name: true, color: true } },
      _count: { select: { comments: true } },
    },
  });

  if (!post) notFound();

  const isAdmin = session.user.role === "ADMIN";
  const viewerId = session.user.id;

  // Głosy posta — wcześniej brakujące na widoku izolowanym (pokazywało 0).
  const [up, down, myVote] = await Promise.all([
    prisma.postVote.count({ where: { postId: post.id, value: "UP" } }),
    prisma.postVote.count({ where: { postId: post.id, value: "DOWN" } }),
    prisma.postVote.findUnique({
      where: { userId_postId: { userId: viewerId, postId: post.id } },
      select: { value: true },
    }),
  ]);

  // Wzmianki: migracja + mapa ID → użytkownik.
  const { items: mItems, mentions } = await attachMentions(
    [{ id: post.id, content: post.content }],
    (id, content) => prisma.post.update({ where: { id }, data: { content } })
  );

  const maskedAuthor = maskActivity(post.author, viewerId, isAdmin);

  const postItem = {
    id: post.id,
    authorId: post.authorId,
    title: post.title,
    content: mItems[0]?.content ?? post.content,
    createdAt: post.createdAt.toISOString(),
    author: {
      id: maskedAuthor.id,
      username: maskedAuthor.username,
      email: maskedAuthor.email,
      avatarUrl: maskedAuthor.avatarUrl,
      role: maskedAuthor.role,
      lastActiveAt: maskedAuthor.lastActiveAt
        ? new Date(maskedAuthor.lastActiveAt).toISOString()
        : null,
    },
    category: post.category,
    attachments: post.attachments as { name: string; url: string; type: string; size: number }[] | null,
    _count: post._count,
    votes: { up, down, myVote: myVote?.value ?? null },
    mentions,
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
