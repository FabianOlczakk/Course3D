import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { FormsManager } from "@/components/admin/forms-manager";

export const metadata: Metadata = { title: "Formularze | Interaktywny Kurs Druku 3D" };

export default async function FormsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");
  return <FormsManager />;
}
