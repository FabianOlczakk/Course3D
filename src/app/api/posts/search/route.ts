import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isAnnouncement } from "@/lib/announcements";

const authorSelect = {
  select: { id: true, username: true, email: true, avatarUrl: true, role: true },
} as const;

// Wyszukiwanie postów po treści, tytule oraz treści komentarzy.
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json({ posts: [] });
  }

  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { content: { contains: q, mode: "insensitive" } },
        { title: { contains: q, mode: "insensitive" } },
        {
          comments: {
            some: { content: { contains: q, mode: "insensitive" } },
          },
        },
      ],
    },
    include: {
      author: authorSelect,
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const visible = posts.filter((p) => !isAnnouncement(p.attachments));

  return NextResponse.json({ posts: visible });
}
