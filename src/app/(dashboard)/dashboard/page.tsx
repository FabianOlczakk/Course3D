import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLearnerStats } from "@/lib/stats";
import { timeAgo } from "@/lib/format-time";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardMessagesButton } from "@/components/dashboard/dashboard-widgets";
import { AnnouncementsWidget } from "@/components/dashboard/announcements-widget";
import { DashboardAiCard } from "@/components/dashboard/dashboard-ai-card";

export const metadata: Metadata = {
  title: "Pulpit — Kurs druku 3D",
};

function initialsOf(s: string) {
  return s.slice(0, 2).toUpperCase();
}

function colorFromString(str: string): string {
  const palette = ["#9d6bff", "#5b8def", "#3ecf8e", "#e0944a", "#d9536a"];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export default async function DashboardPage() {
  const session = await auth();
  const name = session?.user?.username || "Kursancie";
  const meId = session?.user?.id ?? "";

  const [unreadMessages, recentPostsRaw, chapters, progressRows, stats, notesCount, me] =
    await Promise.all([
      prisma.message.findMany({
        where: { receiverId: meId, readAt: null },
        orderBy: { createdAt: "desc" },
        take: 4,
        include: {
          sender: {
            select: { id: true, username: true, email: true, avatarUrl: true },
          },
        },
      }),
      prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        take: 12,
        include: {
          author: {
            select: { id: true, username: true, email: true, avatarUrl: true },
          },
          category: { select: { name: true, color: true } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.chapter.findMany({
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" }, select: { id: true, title: true } },
        },
      }),
      prisma.lessonProgress.findMany({
        where: { userId: meId },
        select: { lessonId: true, completed: true, rating: true },
      }),
      getLearnerStats(meId),
      prisma.lessonNote.count({ where: { userId: meId } }),
      prisma.user.findUnique({ where: { id: meId }, select: { aiTokens: true } }),
    ]);

  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const [latestWiki, myNotes, weekPostsRaw, onlineUsers] = await Promise.all([
    prisma.wikiArticle.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, slug: true, category: true, createdAt: true },
    }),
    prisma.lessonNote.findMany({
      where: { userId: meId },
      orderBy: { updatedAt: "desc" },
      take: 3,
      select: {
        id: true,
        content: true,
        updatedAt: true,
        lesson: { select: { id: true, title: true } },
      },
    }),
    prisma.post.findMany({
      where: { createdAt: { gte: weekAgo } },
      take: 30,
      select: {
        id: true,
        title: true,
        content: true,
        votes: { select: { value: true } },
        _count: { select: { comments: true } },
        author: { select: { username: true, email: true } },
      },
    }),
    prisma.user.findMany({
      where: {
        lastActiveAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
        activityPrivate: false,
      },
      orderBy: { lastActiveAt: "desc" },
      take: 10,
      select: { id: true, username: true, email: true, avatarUrl: true },
    }),
  ]);

  // Najpopularniejsze posty tygodnia — po saldzie głosów, potem liczbie komentarzy
  const topWeekPosts = weekPostsRaw
    .map((p) => ({
      ...p,
      score: p.votes.reduce((s, v) => s + (v.value === "UP" ? 1 : -1), 0),
    }))
    .sort((a, b) => b.score - a.score || b._count.comments - a._count.comments)
    .slice(0, 3);

  const completedSet = new Set(progressRows.filter((r) => r.completed).map((r) => r.lessonId));
  // Własne oceny lekcji (1-5 gwiazdek) — do średniej per moduł i ogólnej
  const ratingByLesson = new Map(
    progressRows.filter((r) => r.rating != null).map((r) => [r.lessonId, r.rating as number])
  );
  const allMyRatings = [...ratingByLesson.values()];
  const myAvgRating =
    allMyRatings.length > 0
      ? allMyRatings.reduce((s, r) => s + r, 0) / allMyRatings.length
      : null;

  const recentPosts = recentPostsRaw.slice(0, 3);

  // Ogłoszenia z dedykowanej tabeli (degraduj łagodnie, gdy migracja jeszcze
  // nie została uruchomiona).
  let announcements: {
    id: string;
    title: string;
    createdAt: Date;
    categoryId: string | null;
    category: { name: string; color: string | null } | null;
  }[] = [];
  let announcementCategories: { id: string; name: string; color: string | null }[] = [];
  try {
    [announcements, announcementCategories] = await Promise.all([
      prisma.announcement.findMany({
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        take: 12,
        include: { category: { select: { name: true, color: true } } },
      }),
      prisma.category.findMany({
        where: { type: "ANNOUNCEMENT" },
        orderBy: { name: "asc" },
        select: { id: true, name: true, color: true },
      }),
    ]);
  } catch {
    announcements = [];
  }

  // Aktualna lekcja (pierwsza nieukończona) + numer rozdziału
  let currentLessonId: string | null = null;
  let currentChapterIdx = 0;
  let currentChapterTitle = "";
  let currentLessonTitle = "";
  for (let i = 0; i < chapters.length; i++) {
    const lesson = chapters[i].lessons.find((l) => !completedSet.has(l.id));
    if (lesson) {
      currentLessonId = lesson.id;
      currentChapterIdx = i;
      currentChapterTitle = chapters[i].title;
      currentLessonTitle = lesson.title;
      break;
    }
  }
  const overallPct =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Postęp per rozdział + własna średnia ocena modułu (z ocen lekcji 1-5)
  const modules = chapters.map((c, i) => {
    const total = c.lessons.length;
    const done = c.lessons.filter((l) => completedSet.has(l.id)).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const full = total > 0 && done === total;
    const moduleRatings = c.lessons
      .map((l) => ratingByLesson.get(l.id))
      .filter((r): r is number => r != null);
    const myRating =
      moduleRatings.length > 0
        ? moduleRatings.reduce((s, r) => s + r, 0) / moduleRatings.length
        : null;
    return {
      n: String(i + 1).padStart(2, "0"),
      title: c.title,
      pct,
      myRating,
      ratedCount: moduleRatings.length,
      color: full ? "#3ecf8e" : pct > 0 ? "#9d6bff" : "#3a3a3a",
    };
  });

  const today = new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="p-[26px] md:px-[30px]">
      <h1 className="font-display text-[23px] font-semibold text-[var(--text-primary)]">
        Witaj, {name}
      </h1>
      <p className="mt-[6px] text-[13.5px] capitalize text-[var(--text-muted)]">
        {today}
        <span className="lowercase">
          {" · "}
          masz {unreadMessages.length} nowych wiadomości
          {currentLessonId ? " i 1 lekcję w toku" : ""}
        </span>
      </p>

      {/* Układ: lewa kolumna treści + prawy rail „Twój postęp" */}
      <div className="mt-5 grid grid-cols-1 items-stretch gap-[18px] lg:grid-cols-[1fr_320px]">
       <div className="flex min-w-0 flex-col gap-[18px]">
        <div className="glow-card flex overflow-hidden">
        <div className="flex-1 p-[24px_26px]">
          <span className="inline-block rounded-[5px] bg-[#9d6bff1a] px-[9px] py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--accent-soft)]">
            {currentLessonId
              ? `W trakcie · Rozdział ${String(currentChapterIdx + 1).padStart(2, "0")}`
              : "Kurs ukończony 🎉"}
          </span>
          <h2 className="mb-[5px] mt-[13px] font-display text-[20px] font-semibold text-[var(--text-primary)]">
            {currentLessonTitle || currentChapterTitle || "Druk 3D od zera do mistrza"}
          </h2>
          <p className="mb-4 text-[13.5px] text-[var(--text-muted)]">
            {currentChapterTitle || "Cały materiał kursu"}
          </p>
          <div className="h-[6px] max-w-[420px] overflow-hidden rounded-[4px] bg-[var(--bg-elevated)]">
            <div
              className="h-full rounded-[4px] bg-[var(--accent)]"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <div className="mt-4 flex items-center gap-4">
            {currentLessonId && (
              <Link
                href={`/kurs/${currentLessonId}`}
                className="glow-btn inline-flex items-center gap-[7px] rounded-[6px] px-[17px] py-[9px] text-[13.5px] font-semibold text-white"
              >
                Kontynuuj naukę
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <span className="text-[12.5px] text-[var(--text-muted)]">
              {overallPct}% całego kursu ukończone
            </span>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Ukończone lekcje" value={`${stats.completed}`} suffix={`/ ${stats.total}`} />
        <StatCard label="Passa nauki" value={`${stats.streak}`} suffix="dni" />
        <StatCard
          label="Pozycja w grupie"
          value={`#${stats.rank}`}
          suffix={`z ${stats.rankTotal}`}
        />
        <StatCard label="Twoje notatki" value={`${notesCount}`} suffix={notesCount === 1 ? "notatka" : "notatek"} />
        <StatCard
          label="Tokeny AI"
          value={(me?.aiTokens ?? 0) > 999 ? `${Math.round((me?.aiTokens ?? 0) / 1000)}k` : `${me?.aiTokens ?? 0}`}
          suffix="pozostało"
        />
      </div>

      {/* Wiadomości + Ogłoszenia (dwie kolumny) */}
      <div className="grid grid-cols-1 items-stretch gap-[18px] lg:grid-cols-2">
        {/* Ostatnie wiadomości */}
        <Card className="h-full">
          <CardHeader title="Ostatnie wiadomości">
            <DashboardMessagesButton />
          </CardHeader>
          {unreadMessages.length === 0 ? (
            <p className="py-2 text-[12.5px] text-[var(--text-muted)]">Brak nowych wiadomości.</p>
          ) : (
            unreadMessages.map((m) => {
              const label = m.sender.username || m.sender.email;
              return (
                <Link
                  key={m.id}
                  href={`/profil/${m.sender.id}`}
                  className="flex items-start gap-[11px] border-b border-[var(--border-subtle)] py-[11px] last:border-0"
                >
                  <AvatarCircle url={m.sender.avatarUrl} label={label} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-[var(--text-primary)]">{label}</span>
                      <span className="ml-auto text-[11.5px] text-[var(--text-muted)]">{timeAgo(m.createdAt)}</span>
                    </div>
                    <p className="mt-[3px] truncate text-[12.5px] text-[var(--text-muted)]">{m.content}</p>
                  </div>
                  <span className="mt-[6px] h-[7px] w-[7px] shrink-0 rounded-full bg-[var(--accent)]" />
                </Link>
              );
            })
          )}
        </Card>

        {/* Ogłoszenia */}
        <Card className="h-full">
          <CardHeader title="Ogłoszenia">
            <Link href="/ogloszenia" className="text-[12.5px] font-semibold text-[var(--accent-soft)]">
              Wszystkie
            </Link>
          </CardHeader>
          <AnnouncementsWidget
            announcements={announcements}
            categories={announcementCategories}
          />
        </Card>
      </div>

      {/* Nowości na Wiki + Twoje notatki */}
      <div className="grid grid-cols-1 items-stretch gap-[18px] lg:grid-cols-2">
        <Card className="h-full">
          <CardHeader title="Nowości na Wiki">
            <Link href="/wiki" className="text-[12.5px] font-semibold text-[var(--accent-soft)]">
              Wiki
            </Link>
          </CardHeader>
          {latestWiki.length === 0 ? (
            <p className="py-2 text-[12.5px] text-[var(--text-muted)]">Brak artykułów.</p>
          ) : (
            latestWiki.map((w) => (
              <Link
                key={w.id}
                href={`/wiki/${w.slug}`}
                className="flex items-center gap-[10px] border-b border-[var(--border-subtle)] py-[9px] last:border-0"
              >
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--text-primary)]">
                  {w.title}
                </span>
                {w.category && (
                  <span className="shrink-0 rounded-[4px] bg-[#5b8def1a] px-[6px] py-[1px] text-[10px] font-semibold text-[#a8c4ff]">
                    {w.category}
                  </span>
                )}
                <span className="shrink-0 text-[11px] text-[var(--text-muted)]">{timeAgo(w.createdAt)}</span>
              </Link>
            ))
          )}
        </Card>

        <Card className="h-full">
          <CardHeader title="Twoje notatki">
            <span className="text-[12.5px] text-[var(--text-muted)]">{notesCount} łącznie</span>
          </CardHeader>
          {myNotes.length === 0 ? (
            <p className="py-2 text-[12.5px] text-[var(--text-muted)]">
              Nie masz jeszcze notatek — możesz je dodawać pod każdą lekcją.
            </p>
          ) : (
            myNotes.map((n) => (
              <Link
                key={n.id}
                href={`/kurs/${n.lesson.id}`}
                className="block border-b border-[var(--border-subtle)] py-[9px] last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-[var(--accent-soft)]">
                    {n.lesson.title}
                  </span>
                  <span className="shrink-0 text-[11px] text-[var(--text-muted)]">{timeAgo(n.updatedAt)}</span>
                </div>
                <p className="mt-[3px] line-clamp-2 text-[12.5px] text-[var(--text-secondary)]">{n.content}</p>
              </Link>
            ))
          )}
        </Card>
      </div>

      {/* Popularne w tym tygodniu + Aktywni teraz */}
      <div className="grid grid-cols-1 items-stretch gap-[18px] lg:grid-cols-2">
        <Card className="h-full">
          <CardHeader title="Popularne w tym tygodniu">
            <Link href="/spolecznosc" className="text-[12.5px] font-semibold text-[var(--accent-soft)]">
              Forum
            </Link>
          </CardHeader>
          {topWeekPosts.length === 0 ? (
            <p className="py-2 text-[12.5px] text-[var(--text-muted)]">Brak postów z ostatniego tygodnia.</p>
          ) : (
            topWeekPosts.map((p, i) => (
              <Link
                key={p.id}
                href={`/spolecznosc/${p.id}`}
                className="flex items-center gap-[11px] border-b border-[var(--border-subtle)] py-[9px] last:border-0"
              >
                <span className="w-5 shrink-0 font-display text-[13px] font-bold text-[var(--text-muted)]">
                  {i + 1}.
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-[var(--text-primary)]">
                    {p.title || p.content}
                  </div>
                  <div className="mt-[2px] text-[11px] text-[var(--text-muted)]">
                    {p.author.username || p.author.email} · {p._count.comments} odpowiedzi
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-[4px] px-[6px] py-[1px] text-[11px] font-bold ${
                    p.score >= 0 ? "bg-[#3ecf8e1a] text-[#3ecf8e]" : "bg-[#d9536a1a] text-[#d9536a]"
                  }`}
                >
                  {p.score >= 0 ? "+" : ""}{p.score}
                </span>
              </Link>
            ))
          )}
        </Card>

        <Card className="h-full">
          <CardHeader title="Aktywni teraz">
            <span className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)]">
              <span className="h-[7px] w-[7px] rounded-full bg-[var(--green)]" />
              {onlineUsers.length} online
            </span>
          </CardHeader>
          {onlineUsers.length === 0 ? (
            <p className="py-2 text-[12.5px] text-[var(--text-muted)]">Nikt nie jest teraz aktywny.</p>
          ) : (
            <div className="flex flex-wrap gap-2 py-1">
              {onlineUsers.map((u) => {
                const label = u.username || u.email;
                return (
                  <Link
                    key={u.id}
                    href={`/profil/${u.id}`}
                    title={label}
                    className="flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--bg-elevated)]/60 py-1 pl-1 pr-3 transition-colors hover:border-[var(--accent)]/50"
                  >
                    <span className="relative">
                      <AvatarCircle url={u.avatarUrl} label={label} size={26} />
                      <span className="absolute -bottom-[1px] -right-[1px] h-[9px] w-[9px] rounded-full border-2 border-[var(--bg-card)] bg-[var(--green)]" />
                    </span>
                    <span className="max-w-[110px] truncate text-[12px] font-medium text-[var(--text-primary)]">
                      {label}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Aktywność społeczności (pełna szerokość) */}
      <div>
        <Card>
          <CardHeader title="Aktywność społeczności">
            <Link href="/spolecznosc" className="text-[12.5px] font-semibold text-[var(--accent-soft)]">
              Przejdź
            </Link>
          </CardHeader>
          {recentPosts.length === 0 ? (
            <p className="py-2 text-[12.5px] text-[var(--text-muted)]">Brak postów.</p>
          ) : (
            recentPosts.map((p) => {
              const label = p.author.username || p.author.email;
              return (
                <Link
                  key={p.id}
                  href="/spolecznosc"
                  className="flex items-start gap-[11px] border-b border-[var(--border-subtle)] py-3 last:border-0"
                >
                  <AvatarCircle url={p.author.avatarUrl} label={label} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="mb-[3px] flex items-center gap-[6px] text-[11.5px] text-[var(--text-muted)]">
                      {label} · {timeAgo(p.createdAt)}
                      {p.category && (
                        <span
                          className="shrink-0 rounded-[4px] px-[6px] py-[1px] text-[10px] font-semibold"
                          style={{
                            background: (p.category.color || "#9d6bff") + "1a",
                            color: p.category.color || "var(--accent-soft)",
                          }}
                        >
                          {p.category.name}
                        </span>
                      )}
                    </div>
                    <div className="truncate text-[13.5px] font-semibold text-[var(--text-primary)]">
                      {p.title || p.content}
                    </div>
                    <div className="mt-[6px] text-[11.5px] text-[var(--text-muted)]">
                      {p._count.comments} odpowiedzi
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </Card>
      </div>
       </div>

       {/* PRAWY RAIL — Twój postęp + Asystent AI.
           Na lg+ zawartość raila jest pozycjonowana absolutnie, więc nie
           wpływa na wysokość rzędu siatki — rail kończy się dokładnie na
           równi z lewą kolumną, a lista modułów przewija się w środku. */}
       <div className="relative min-h-[420px]">
        <div className="flex flex-col gap-[18px] lg:absolute lg:inset-0">
       <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
         <CardHeader title="Twój postęp">
           <Link
             href={currentLessonId ? `/kurs/${currentLessonId}` : "/dashboard"}
             className="text-[12.5px] font-semibold text-[var(--accent-soft)]"
           >
             Kurs
           </Link>
         </CardHeader>
         <div className="-mr-1 min-h-0 flex-1 overflow-auto pr-1">
           {modules.length === 0 ? (
             <p className="py-2 text-[12.5px] text-[var(--text-muted)]">Brak rozdziałów.</p>
           ) : (
             modules.map((m) => (
               <div key={m.n} className="py-[9px]">
                 <div className="mb-[7px] flex items-center gap-[10px]">
                   <span className="font-display text-[11px] font-semibold text-[var(--text-muted)]">
                     {m.n}
                   </span>
                   <span className="flex-1 truncate text-[12.5px] font-medium text-[var(--text-primary)]">
                     {m.title}
                   </span>
                   {m.myRating != null && (
                     <span
                       className="flex items-center gap-[3px] text-[11px] font-semibold text-[#e0b44a]"
                       title={`Twoja ocena modułu (średnia z ${m.ratedCount} ocenionych lekcji)`}
                     >
                       <Star className="h-[11px] w-[11px] fill-current" />
                       {m.myRating.toFixed(1)}
                     </span>
                   )}
                   <span className="text-[11px] font-semibold" style={{ color: m.color }}>
                     {m.pct}%
                   </span>
                 </div>
                 <div className="h-[5px] overflow-hidden rounded-[3px] bg-[var(--bg-elevated)]">
                   <div
                     className="h-full rounded-[3px]"
                     style={{ width: `${m.pct}%`, background: m.color }}
                   />
                 </div>
               </div>
             ))
           )}
         </div>
         {myAvgRating != null && (
           <div className="mt-2 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3 text-[12px]">
             <span className="text-[var(--text-muted)]">Twoja średnia ocena kursu</span>
             <span className="flex items-center gap-1 font-semibold text-[#e0b44a]">
               <Star className="h-3 w-3 fill-current" />
               {myAvgRating.toFixed(1)} / 5
             </span>
           </div>
         )}
       </Card>

       <DashboardAiCard />
        </div>
       </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="glow-card p-[16px_18px]">
      <div className="text-[12px] font-medium text-[var(--text-muted)]">{label}</div>
      <div className="mt-[6px] font-display text-[23px] font-semibold text-[var(--text-primary)]">
        {value}{" "}
        {suffix && (
          <span className="text-[14px] font-medium text-[var(--text-muted)]">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`glow-card p-[16px_18px] ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

function CardHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-[6px] flex items-center">
      <span className="font-display text-[14.5px] font-semibold text-[var(--text-primary)]">
        {title}
      </span>
      <span className="ml-auto">{children}</span>
    </div>
  );
}

function AvatarCircle({
  url,
  label,
  size,
}: {
  url?: string | null;
  label: string;
  size: number;
}) {
  if (url) {
    return (
      <Avatar style={{ width: size, height: size }} className="shrink-0">
        <AvatarImage src={url} />
        <AvatarFallback className="text-[12.5px]">
          {initialsOf(label)}
        </AvatarFallback>
      </Avatar>
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full text-[12.5px] font-semibold text-white"
      style={{ width: size, height: size, background: colorFromString(label) }}
    >
      {initialsOf(label)}
    </div>
  );
}
