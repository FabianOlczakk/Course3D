import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminBadge } from "@/components/shared/admin-badge";
import { ProfileActions } from "@/components/profile/profile-actions";
import { isAnnouncement } from "@/lib/announcements";
import { timeAgo } from "@/lib/format-time";

export default async function ProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const viewerIsAdmin = session.user.role === "ADMIN";

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
    },
  });
  if (!user) notFound();

  const [completed, total, posts] = await Promise.all([
    prisma.lessonProgress.count({
      where: { userId: user.id, completed: true },
    }),
    prisma.lesson.count(),
    prisma.post.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const recentPosts = posts.filter((p) => !isAnnouncement(p.attachments)).slice(0, 10);
  const name = user.username || user.email;
  const initials = name.slice(0, 2).toUpperCase();
  const isSelf = user.id === session.user.id;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div className="glow-card glow-border p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={name} />}
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-2xl font-bold text-text-primary">{name}</h1>
              {user.role === "ADMIN" ? (
                <AdminBadge role="ADMIN" />
              ) : (
                <span className="rounded px-1.5 py-0.5 text-xs font-semibold bg-gray-500/20 text-gray-300 border border-gray-500/30">
                  Kursant
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-text-muted">
              Dołączył(a) {timeAgo(user.createdAt.toISOString())}
            </p>
          </div>
          {!isSelf && (
            <ProfileActions
              user={{
                id: user.id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl,
                role: user.role,
              }}
              viewerIsAdmin={viewerIsAdmin}
            />
          )}
        </div>
      </div>

      <div className="glow-card p-6">
        <h2 className="mb-3 text-lg font-semibold text-text-primary">
          Postęp w kursie
        </h2>
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>
            Ukończono {completed} z {total} lekcji
          </span>
          <span className="font-medium text-text-primary">{pct}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent-glow)]"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="glow-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Posty w społeczności
        </h2>
        {recentPosts.length === 0 ? (
          <p className="text-sm text-text-muted">
            Ten użytkownik nie dodał jeszcze żadnych postów.
          </p>
        ) : (
          <ul className="space-y-3">
            {recentPosts.map((p) => (
              <li key={p.id} className="border-t border-[var(--border-subtle)] pt-3 first:border-0 first:pt-0">
                {p.title && (
                  <p className="font-medium text-text-primary">{p.title}</p>
                )}
                <p className="line-clamp-2 text-sm text-text-secondary">
                  {p.content}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {timeAgo(p.createdAt.toISOString())}
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
  );
}
