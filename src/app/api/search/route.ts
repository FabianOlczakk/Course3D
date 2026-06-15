import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const search = `%${q}%`;

  const [lessons, posts, wiki] = await Promise.all([
    prisma.lesson.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: { id: true, title: true, description: true, chapterId: true },
    }),
    prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, content: true, createdAt: true,
        author: { select: { username: true, email: true } },
      },
    }),
    prisma.wikiArticle.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: { id: true, title: true, slug: true, category: true },
    }),
  ]);

  // Ignoruj nieużywaną zmienną search (do raw query gdyby potrzeba)
  void search;

  return NextResponse.json({
    results: {
      lessons: lessons.map((l) => ({
        type: "lesson" as const,
        id: l.id,
        title: l.title,
        description: l.description ?? "",
        url: `/kurs/${l.id}`,
      })),
      posts: posts.map((p) => ({
        type: "post" as const,
        id: p.id,
        title: p.title ?? p.content.slice(0, 60),
        description: p.author.username ?? p.author.email,
        url: `/spolecznosc`,
      })),
      wiki: wiki.map((w) => ({
        type: "wiki" as const,
        id: w.id,
        title: w.title,
        description: w.category ?? "Wiki",
        url: `/wiki/${w.slug}`,
      })),
    },
    query: q,
  });
}
