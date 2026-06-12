import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Oznacz wszystkie wiadomości od :userId jako przeczytane.
export async function POST(
  _req: Request,
  { params }: { params: { userId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  await prisma.message.updateMany({
    where: {
      senderId: params.userId,
      receiverId: session.user.id,
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
