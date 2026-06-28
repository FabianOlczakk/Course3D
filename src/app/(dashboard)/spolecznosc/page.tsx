import { redirect } from "next/navigation";
import { Users2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { PostFeed } from "@/components/community/post-feed";

export const metadata = {
  title: "Społeczność — Kurs druku 3D",
};

export default async function CommunityPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto max-w-[740px] p-[26px] md:px-[30px]">
      <h1 className="flex items-center gap-2 font-display text-[23px] font-semibold text-[#f0f0f0]">
        <Users2 className="h-6 w-6 text-[var(--accent)]" />
        Społeczność
      </h1>
      <p className="mb-[18px] mt-[6px] text-[13.5px] text-[#8a8a8a]">
        Zadawaj pytania, dziel się wydrukami i pomagaj innym kursantom
      </p>
      <PostFeed
        currentUserId={session.user.id}
        isAdmin={session.user.role === "ADMIN"}
      />
    </div>
  );
}
