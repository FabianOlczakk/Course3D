import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

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

  return (
    <Providers>
      <div className="flex min-h-screen">
        <Sidebar role={role} />
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
