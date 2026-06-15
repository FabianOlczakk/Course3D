import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  category: z.string().optional().nullable(),
  published: z.boolean().optional(),
});

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const article = await prisma.wikiArticle.findUnique({
    where: { slug: params.slug },
    include: { author: { select: { id: true, username: true, email: true, avatarUrl: true } } },
  });
  if (!article) return NextResponse.json({ error: "Nie znaleziono." }, { status: 404 });
  return NextResponse.json({ article });
}

export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }

  const article = await prisma.wikiArticle.update({
    where: { slug: params.slug },
    data: { ...parsed.data, updatedAt: new Date() },
  });
  return NextResponse.json({ article });
}

export async function DELETE(_req: Request, { params }: { params: { slug: string } }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }

  await prisma.wikiArticle.delete({ where: { slug: params.slug } });
  return NextResponse.json({ ok: true });
}
