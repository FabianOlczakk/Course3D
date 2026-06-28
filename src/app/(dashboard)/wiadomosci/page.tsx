import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MessagesPageView } from "@/components/messages/messages-page";

export const metadata: Metadata = {
  title: "Wiadomości — Kurs druku 3D",
};

export default async function MessagesRoutePage({
  searchParams,
}: {
  searchParams: { u?: string };
}) {
  const targetId = searchParams.u;
  const initialUser = targetId
    ? await prisma.user.findUnique({
        where: { id: targetId },
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
          role: true,
          lastActiveAt: true,
        },
      })
    : null;

  return <MessagesPageView initialUser={initialUser} />;
}
