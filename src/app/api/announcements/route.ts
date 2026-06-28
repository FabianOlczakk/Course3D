import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-guard";

const authorSelect = {
  select: { id: true, username: true, email: true, avatarUrl: true, role: true },
} as const;
const categorySelect = {
  select: { id: true, name: true, color: true },
} as const;

// Lista ogłoszeń — przypięte najpierw, potem najnowsze.
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const announcements = await prisma.announcement.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    include: { author: authorSelect, category: categorySelect },
    take: 100,
  });

  return NextResponse.json({ announcements });
}

const createSchema = z.object({
  title: z.string().trim().min(1, "Tytuł jest wymagany.").max(255),
  content: z.string().trim().min(1, "Treść nie może być pusta.").max(100000),
  categoryId: z.string().optional().nullable(),
  pinned: z.boolean().optional(),
});

// Utwórz ogłoszenie (tylko admin).
export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Nieprawidłowe dane." },
      { status: 400 }
    );
  }

  const announcement = await prisma.announcement.create({
    data: {
      authorId: session.user.id,
      title: parsed.data.title,
      content: parsed.data.content,
      categoryId: parsed.data.categoryId || null,
      pinned: parsed.data.pinned ?? false,
    },
    include: { author: authorSelect, category: categorySelect },
  });

  return NextResponse.json({ announcement }, { status: 201 });
}
