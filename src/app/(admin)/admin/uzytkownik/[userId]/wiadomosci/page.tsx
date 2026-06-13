import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { AdminUserMessages } from "@/components/admin/admin-user-messages";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Wiadomości użytkownika | Panel Admina",
};

export default async function AdminUserMessagesPage({
  params,
}: {
  params: { userId: string };
}) {
  await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { id: true, username: true, email: true },
  });
  if (!user) notFound();

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">
          Wiadomości: {user.username || user.email}
        </h1>
        <p className="text-muted-foreground">
          Podgląd konwersacji użytkownika (tylko do odczytu).
        </p>
      </div>
      <AdminUserMessages userId={user.id} />
    </div>
  );
}
