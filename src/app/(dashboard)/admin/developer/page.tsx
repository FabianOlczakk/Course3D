import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DeveloperClient } from "@/components/admin/developer-client";

export const metadata: Metadata = { title: "Deweloper — Course3D" };

export default async function DeveloperPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");
  return <DeveloperClient />;
}
