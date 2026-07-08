import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { UsersTable } from "@/components/admin/users-table";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";
import { ImportCsvDialog } from "@/components/admin/import-csv-dialog";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
      lastActiveAt: true,
      emailVerified: true,
      inviteToken: true,
    },
  });

  const serialized = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    lastActiveAt: u.lastActiveAt ? u.lastActiveAt.toISOString() : null,
    pending: !u.emailVerified && !!u.inviteToken,
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-[var(--accent)]" />
            <h1 className="font-display text-[20px] font-semibold text-[var(--text-primary)]">Użytkownicy</h1>
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Zarządzaj kontami kursantów i administratorów.
          </p>
        </div>
        <div className="flex gap-2">
          <ImportCsvDialog />
          <CreateUserDialog />
        </div>
      </div>

      <UsersTable users={serialized} />
    </div>
  );
}
