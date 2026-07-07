import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { EmailCampaignManager } from "@/components/admin/email-campaign-manager";

export const metadata: Metadata = { title: "Email | Interaktywny Kurs Druku 3D" };

export default async function EmailPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");
  return <EmailCampaignManager />;
}
