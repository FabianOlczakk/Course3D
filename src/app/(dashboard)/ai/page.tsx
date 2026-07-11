import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AiChat } from "@/components/ai/ai-chat";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "AI | Interaktywny Kurs Druku 3D" };

export default async function AiPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { aiTokens: true } });

  return <AiChat initialTokens={user?.aiTokens ?? 0} />;
}
