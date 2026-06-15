import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Slug może zawierać tylko małe litery, cyfry i myślniki"),
  content: z.string().min(1),
  category: z.string().optional(),
  published: z.boolean().optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const onlyPublished = searchParams.get("all") !== "1";

  const articles = await prisma.wikiArticle.findMany({
    where: {
      ...(onlyPublished ? { published: true } : {}),
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, title: true, slug: true, category: true,
      published: true, createdAt: true, updatedAt: true,
      author: { select: { id: true, username: true, email: true } },
    },
  });

  const categories = await prisma.wikiArticle.groupBy({
    by: ["category"],
    where: onlyPublished ? { published: true } : {},
    _count: true,
  });

  return NextResponse.json({ articles, categories });
}

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Nieprawidłowe dane." }, { status: 400 });
  }

  try {
    const article = await prisma.wikiArticle.create({
      data: {
        ...parsed.data,
        published: parsed.data.published ?? true,
        authorId: session.user.id,
      },
    });
    return NextResponse.json({ article });
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === "P2002") {
      return NextResponse.json({ error: "Artykuł z takim slugiem już istnieje." }, { status: 409 });
    }
    throw err;
  }
}
