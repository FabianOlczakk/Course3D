import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ ok: false });

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastActiveAt: new Date() },
    });
  } catch {
    // tabela może nie mieć kolumny — ignoruj błąd
  }
  return NextResponse.json({ ok: true });
}
