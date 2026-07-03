import type { Metadata } from "next";
import { AppShell } from "@/components/dashboard/app-shell";

export const metadata: Metadata = {
  title: "Panel Admina | Interaktywny Kurs Druku 3D",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell requireAdmin>{children}</AppShell>;
}
