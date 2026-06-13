import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isAnnouncement } from "@/lib/announcements";

// Publiczny profil użytkownika (dostępny dla zalogowanych).
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Nie znaleziono użytkownika." },
      { status: 404 }
    );
  }

  const [completed, total, posts] = await Promise.all([
    prisma.lessonProgress.count({
      where: { userId: user.id, completed: true },
    }),
    prisma.lesson.count(),
    prisma.post.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        content: true,
        attachments: true,
        createdAt: true,
      },
    }),
  ]);

  const recentPosts = posts
    .filter((p) => !isAnnouncement(p.attachments))
    .slice(0, 10)
    .map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      createdAt: p.createdAt,
    }));

  return NextResponse.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    progress: { completed, total },
    recentPosts,
  });
}
