import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { aiTokens: true } });
  return NextResponse.json({ tokensRemaining: user?.aiTokens ?? 0 });
}
