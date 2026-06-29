import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Providers } from "@/components/providers";
import { ShellFrame } from "@/components/dashboard/shell-frame";
import type { SidebarChapter } from "@/components/chapters/chapter-list";

export async function AppShell({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (requireAdmin && session.user.role !== "ADMIN") redirect("/dashboard");

  const { id: userId, username, email, role, image } = session.user;

  const chapters: SidebarChapter[] = await prisma.chapter.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      iconUrl: true,
      lessons: {
        orderBy: { order: "asc" },
        select: { id: true, title: true },
      },
    },
  });

  return (
    <Providers>
      <ShellFrame
        userId={userId}
        username={username}
        email={email ?? ""}
        role={role}
        avatarUrl={image}
        chapters={chapters}
      >
        {children}
      </ShellFrame>
    </Providers>
  );
}
