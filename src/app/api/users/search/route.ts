import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Wyszukiwanie użytkowników po nazwie lub e-mailu (do rozpoczęcia nowej konwersacji).
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) {
    return NextResponse.json({ users: [] });
  }

  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: session.user.id } },
        {
          OR: [
            { username: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
      ],
    },
    take: 10,
    orderBy: { username: "asc" },
    select: { id: true, username: true, email: true, avatarUrl: true },
  });

  return NextResponse.json({ users });
}
