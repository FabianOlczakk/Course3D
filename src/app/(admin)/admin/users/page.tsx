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
      emailVerified: true,
      inviteToken: true,
    },
  });

  const serialized = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    pending: !u.emailVerified && !!u.inviteToken,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Użytkownicy</h1>
          <p className="text-muted-foreground">
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
