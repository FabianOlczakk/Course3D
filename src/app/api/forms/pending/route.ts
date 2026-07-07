import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const userId = session.user.id;

  // Find user's join date
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } });
  if (!user) return NextResponse.json({ forms: [] });

  // Get all active forms
  const allForms = await prisma.form.findMany({
    where: { active: true },
    include: {
      questions: { orderBy: { order: "asc" } },
      responses: { where: { userId }, select: { id: true, skipped: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Filter: not already responded, and visibility matches
  const pending = allForms.filter((f) => {
    if (f.responses.length > 0) return false; // already answered/skipped
    if (f.visibility === "ALL") return true;
    if (f.visibility === "NEW") {
      // Show only if user joined after form was created
      return user.createdAt >= f.createdAt;
    }
    if (f.visibility === "ACTIVE") {
      // Show only if user existed when form was created
      return user.createdAt < f.createdAt;
    }
    return true;
  });

  return NextResponse.json({ forms: pending });
}
