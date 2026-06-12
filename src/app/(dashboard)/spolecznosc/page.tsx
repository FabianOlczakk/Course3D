import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PostFeed } from "@/components/community/post-feed";

export const metadata = {
  title: "Społeczność — Course3D",
};

export default async function CommunityPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="p-4 md:p-6 mx-auto max-w-2xl">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-text-primary">
        👥 Społeczność
      </h1>
      <PostFeed
        currentUserId={session.user.id}
        isAdmin={session.user.role === "ADMIN"}
      />
    </div>
  );
}
