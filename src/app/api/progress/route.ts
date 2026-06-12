import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/progress — cały postęp zalogowanego użytkownika
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const progress = await prisma.lessonProgress.findMany({
    where: { userId: session.user.id },
    select: { lessonId: true, completed: true, watchedSeconds: true },
  });

  return NextResponse.json({ progress });
}
