"use client";

import { useRouter } from "next/navigation";
import { PostCard } from "./post-card";
import type { PostItem } from "./types";

interface Props {
  post: PostItem;
  currentUserId: string;
  isAdmin: boolean;
}

export function PostDetailClient({ post, currentUserId, isAdmin }: Props) {
  const router = useRouter();
  return (
    <PostCard
      post={post}
      currentUserId={currentUserId}
      isAdmin={isAdmin}
      defaultExpanded
      onDeleted={() => router.push("/spolecznosc")}
    />
  );
}
