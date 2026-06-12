import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Liczba nieprzeczytanych wiadomości dla bieżącego użytkownika (badge w topbarze).
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const count = await prisma.message.count({
    where: { receiverId: session.user.id, readAt: null },
  });

  return NextResponse.json({ count });
}
