import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
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

  const { username, email, role, image } = session.user;

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
      <div className="flex min-h-screen">
        <Sidebar role={role} chapters={chapters} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            username={username}
            email={email ?? ""}
            role={role}
            avatarUrl={image}
          />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </Providers>
  );
}
