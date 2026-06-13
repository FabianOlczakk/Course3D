import type { Metadata } from "next";
import Link from "next/link";
import { PlayCircle, BookOpen, MessageSquare, Users2 } from "lucide-react";
import { auth } from "@/lib/auth";
import {
  ProgressOverview,
  ChapterProgressBar,
} from "@/components/dashboard/progress-overview";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardMessagesButton } from "@/components/dashboard/dashboard-widgets";
import { timeAgo } from "@/lib/format-time";
import { isAnnouncement } from "@/lib/announcements";

export const metadata: Metadata = {
  title: "Kurs Druku 3D",
};
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  const name = session?.user?.username || "Kursancie";
  const meId = session?.user?.id ?? "";

  const [unreadMessages, recentPostsRaw] = await Promise.all([
    prisma.message.findMany({
      where: { receiverId: meId, readAt: null },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        sender: { select: { id: true, username: true, email: true, avatarUrl: true } },
      },
    }),
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        author: { select: { id: true, username: true, email: true, avatarUrl: true } },
      },
    }),
  ]);

  const recentPosts = recentPostsRaw
    .filter((p) => !isAnnouncement(p.attachments))
    .slice(0, 3);

  const chapters = await prisma.chapter.findMany({
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, description: true },
      },
    },
  });

  const firstLesson = chapters.flatMap((c) => c.lessons)[0];

  return (
    <div className="p-4 md:p-6 space-y-8">
      <div className="glow-card glow-border relative overflow-hidden p-8">
        <h1 className="text-3xl font-bold text-text-primary">Witaj, {name}!</h1>
        <p className="mt-1 text-text-secondary">
          Kontynuuj naukę druku 3D z drukarką Bambu Lab A1 Mini.
        </p>
        {firstLesson && (
          <Link
            href={`/kurs/${firstLesson.id}`}
            className="glow-btn mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
          >
            <PlayCircle className="h-4 w-4" />
            Kontynuuj naukę
          </Link>
        )}
      </div>

      <ProgressOverview />

      {/* Widgety: wiadomości i społeczność */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glow-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-text-primary">
            <MessageSquare className="h-5 w-5 text-[var(--accent)]" />
            Nieprzeczytane wiadomości
          </h2>
          {unreadMessages.length === 0 ? (
            <p className="text-sm text-text-muted">Brak nowych wiadomości.</p>
          ) : (
            <ul className="space-y-3">
              {unreadMessages.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/profil/${m.sender.id}`}
                    className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-[var(--bg-elevated)]"
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      {m.sender.avatarUrl && (
                        <AvatarImage src={m.sender.avatarUrl} />
                      )}
                      <AvatarFallback className="text-xs">
                        {(m.sender.username || m.sender.email)
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {m.sender.username || m.sender.email}
                      </p>
                      <p className="truncate text-xs text-text-secondary">
                        {m.content}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <DashboardMessagesButton />
        </div>

        <div className="glow-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-text-primary">
            <Users2 className="h-5 w-5 text-[var(--accent)]" />
            Ostatnie w społeczności
          </h2>
          {recentPosts.length === 0 ? (
            <p className="text-sm text-text-muted">Brak postów.</p>
          ) : (
            <ul className="space-y-3">
              {recentPosts.map((p) => (
                <li key={p.id} className="rounded-md p-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 shrink-0">
                      {p.author.avatarUrl && (
                        <AvatarImage src={p.author.avatarUrl} />
                      )}
                      <AvatarFallback className="text-[10px]">
                        {(p.author.username || p.author.email)
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-text-primary">
                      {p.author.username || p.author.email}
                    </span>
                    <span className="text-xs text-text-muted">
                      {timeAgo(p.createdAt.toISOString())}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                    {p.title ? `${p.title} — ` : ""}
                    {p.content}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/spolecznosc"
            className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline"
          >
            Przejdź do społeczności →
          </Link>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold text-text-primary">Twój kurs</h2>

        {chapters.length === 0 ? (
          <div className="glow-card p-8 text-center text-text-secondary">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-text-muted" />
            Brak rozdziałów. Administrator wkrótce doda kurs.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="glow-card p-6">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-2xl">{chapter.iconUrl || "📘"}</span>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-text-primary">
                      {chapter.title}
                    </h3>
                    <p className="text-xs text-text-muted">
                      {chapter.lessons.length} lekcji
                    </p>
                  </div>
                </div>
                {chapter.description && (
                  <p className="mb-3 text-sm text-text-secondary">
                    {chapter.description}
                  </p>
                )}
                <ChapterProgressBar chapterId={chapter.id} />
                <ul className="mt-3 space-y-1">
                  {chapter.lessons.map((lesson) => (
                    <li key={lesson.id}>
                      <Link
                        href={`/kurs/${lesson.id}`}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-secondary transition-colors hover:bg-[var(--bg-elevated)] hover:text-text-primary"
                      >
                        <PlayCircle className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                        <span className="min-w-0 flex-1 truncate">
                          {lesson.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                  {chapter.lessons.length === 0 && (
                    <li className="px-2 py-1.5 text-sm text-text-muted">
                      Brak lekcji w tym rozdziale.
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
