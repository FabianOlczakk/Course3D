import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-guard";
import { ANNOUNCEMENT_MARKER, isAnnouncement } from "@/lib/announcements";

const authorSelect = {
  select: { id: true, username: true, email: true, avatarUrl: true, role: true },
} as const;

// Lista ogłoszeń (najnowsze pierwsze).
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const posts = await prisma.post.findMany({
    where: { attachments: { not: Prisma.DbNull } },
    orderBy: { createdAt: "desc" },
    include: { author: authorSelect },
    take: 100,
  });

  const announcements = posts
    .filter((p) => isAnnouncement(p.attachments))
    .map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      createdAt: p.createdAt,
      author: p.author,
    }));

  return NextResponse.json({ announcements });
}

const createSchema = z.object({
  title: z.string().trim().min(1, "Tytuł jest wymagany.").max(255),
  content: z.string().trim().min(1, "Treść nie może być pusta.").max(100000),
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

  const post = await prisma.post.create({
    data: {
      authorId: session.user.id,
      title: parsed.data.title,
      content: parsed.data.content,
      attachments: [{ type: ANNOUNCEMENT_MARKER }],
    },
    include: { author: authorSelect },
  });

  return NextResponse.json({ announcement: post }, { status: 201 });
}
