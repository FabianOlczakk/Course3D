import { AdminPagesClient } from "@/components/admin/admin-pages-client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminStronyPage() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") redirect("/dashboard");
  return <AdminPagesClient />;
}
