import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLearnerStats } from "@/lib/stats";
import { timeAgo } from "@/lib/format-time";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardMessagesButton } from "@/components/dashboard/dashboard-widgets";

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

  const [unreadMessages, recentPostsRaw, chapters, completedRows, stats] =
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
        where: { userId: meId, completed: true },
        select: { lessonId: true },
      }),
      getLearnerStats(meId),
    ]);

  const completedSet = new Set(completedRows.map((r) => r.lessonId));

  const recentPosts = recentPostsRaw.slice(0, 3);

  // Ogłoszenia z dedykowanej tabeli (degraduj łagodnie, gdy migracja jeszcze
  // nie została uruchomiona).
  let announcements: {
    id: string;
    title: string;
    createdAt: Date;
    category: { name: string; color: string | null } | null;
  }[] = [];
  try {
    announcements = await prisma.announcement.findMany({
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      take: 3,
      include: { category: { select: { name: true, color: true } } },
    });
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

  // Postęp per rozdział
  const modules = chapters.map((c, i) => {
    const total = c.lessons.length;
    const done = c.lessons.filter((l) => completedSet.has(l.id)).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const full = total > 0 && done === total;
    return {
      n: String(i + 1).padStart(2, "0"),
      title: c.title,
      pct,
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
      <h1 className="font-display text-[23px] font-semibold text-[#f0f0f0]">
        Witaj ponownie, {name}
      </h1>
      <p className="mt-[6px] text-[13.5px] capitalize text-[#8a8a8a]">
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
        <div className="flex overflow-hidden rounded-[10px] border border-[#2b2b2b] bg-[#1e1e1e]">
        <div className="flex-1 p-[24px_26px]">
          <span className="inline-block rounded-[5px] bg-[#9d6bff1a] px-[9px] py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--accent-soft)]">
            {currentLessonId
              ? `W trakcie · Rozdział ${String(currentChapterIdx + 1).padStart(2, "0")}`
              : "Kurs ukończony 🎉"}
          </span>
          <h2 className="mb-[5px] mt-[13px] font-display text-[20px] font-semibold text-[#f0f0f0]">
            {currentLessonTitle || currentChapterTitle || "Druk 3D od zera do mistrza"}
          </h2>
          <p className="mb-4 text-[13.5px] text-[#8f8f8f]">
            {currentChapterTitle || "Cały materiał kursu"}
          </p>
          <div className="h-[6px] max-w-[420px] overflow-hidden rounded-[4px] bg-[#2b2b2b]">
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
            <span className="text-[12.5px] text-[#7a7a7a]">
              {overallPct}% całego kursu ukończone
            </span>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Ukończone lekcje" value={`${stats.completed}`} suffix={`/ ${stats.total}`} />
        <StatCard label="Passa nauki" value={`${stats.streak}`} suffix="dni" />
        <StatCard
          label="Pozycja w grupie"
          value={`#${stats.rank}`}
          suffix={`z ${stats.rankTotal}`}
        />
      </div>

      {/* Wiadomości + Ogłoszenia (dwie kolumny) */}
      <div className="grid grid-cols-1 items-start gap-[18px] lg:grid-cols-2">
        {/* Ostatnie wiadomości */}
        <Card>
          <CardHeader title="Ostatnie wiadomości">
            <DashboardMessagesButton />
          </CardHeader>
          {unreadMessages.length === 0 ? (
            <p className="py-2 text-[12.5px] text-[#8a8a8a]">Brak nowych wiadomości.</p>
          ) : (
            unreadMessages.map((m) => {
              const label = m.sender.username || m.sender.email;
              return (
                <Link
                  key={m.id}
                  href={`/profil/${m.sender.id}`}
                  className="flex items-start gap-[11px] border-b border-[#262626] py-[11px] last:border-0"
                >
                  <AvatarCircle url={m.sender.avatarUrl} label={label} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-[#ededed]">{label}</span>
                      <span className="ml-auto text-[11.5px] text-[#6e6e6e]">{timeAgo(m.createdAt)}</span>
                    </div>
                    <p className="mt-[3px] truncate text-[12.5px] text-[#8a8a8a]">{m.content}</p>
                  </div>
                  <span className="mt-[6px] h-[7px] w-[7px] shrink-0 rounded-full bg-[var(--accent)]" />
                </Link>
              );
            })
          )}
        </Card>

        {/* Ogłoszenia */}
        <Card>
          <CardHeader title="Ogłoszenia">
            <Link href="/ogloszenia" className="text-[12.5px] font-semibold text-[var(--accent-soft)]">
              Wszystkie
            </Link>
          </CardHeader>
          {announcements.length === 0 ? (
            <p className="py-2 text-[12.5px] text-[#8a8a8a]">Brak ogłoszeń.</p>
          ) : (
            announcements.map((a) => (
              <div key={a.id} className="border-b border-[#262626] py-[11px] last:border-0">
                <div className="mb-1 flex items-center gap-[7px]">
                  <span
                    className="rounded-[4px] px-[7px] py-[2px] text-[10px] font-semibold"
                    style={{
                      background: (a.category?.color || "#9d6bff") + "1a",
                      color: a.category?.color || "var(--accent-soft)",
                    }}
                  >
                    {a.category?.name || "Ogłoszenie"}
                  </span>
                  <span className="ml-auto text-[11px] text-[#6e6e6e]">{timeAgo(a.createdAt)}</span>
                </div>
                <div className="text-[13px] font-semibold text-[#ededed]">{a.title}</div>
              </div>
            ))
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
            <p className="py-2 text-[12.5px] text-[#8a8a8a]">Brak postów.</p>
          ) : (
            recentPosts.map((p) => {
              const label = p.author.username || p.author.email;
              return (
                <Link
                  key={p.id}
                  href="/spolecznosc"
                  className="flex items-start gap-[11px] border-b border-[#262626] py-3 last:border-0"
                >
                  <AvatarCircle url={p.author.avatarUrl} label={label} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="mb-[3px] text-[11.5px] text-[#8a8a8a]">
                      {label} · {timeAgo(p.createdAt)}
                    </div>
                    <div className="truncate text-[13.5px] font-semibold text-[#ededed]">
                      {p.title || p.content}
                    </div>
                    <div className="mt-[6px] text-[11.5px] text-[#6e6e6e]">
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

       {/* PRAWY RAIL — Twój postęp (rozciąga się na całą wysokość kolumny) */}
       <Card className="flex h-full flex-col overflow-hidden">
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
             <p className="py-2 text-[12.5px] text-[#8a8a8a]">Brak rozdziałów.</p>
           ) : (
             modules.map((m) => (
               <div key={m.n} className="py-[9px]">
                 <div className="mb-[7px] flex items-center gap-[10px]">
                   <span className="font-display text-[11px] font-semibold text-[#6e6e6e]">
                     {m.n}
                   </span>
                   <span className="flex-1 truncate text-[12.5px] font-medium text-[#cfcfcf]">
                     {m.title}
                   </span>
                   <span className="text-[11px] font-semibold" style={{ color: m.color }}>
                     {m.pct}%
                   </span>
                 </div>
                 <div className="h-[5px] overflow-hidden rounded-[3px] bg-[#2b2b2b]">
                   <div
                     className="h-full rounded-[3px]"
                     style={{ width: `${m.pct}%`, background: m.color }}
                   />
                 </div>
               </div>
             ))
           )}
         </div>
       </Card>
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
    <div className="rounded-[10px] border border-[#2b2b2b] bg-[#1e1e1e] p-[16px_18px]">
      <div className="text-[12px] font-medium text-[#8a8a8a]">{label}</div>
      <div className="mt-[6px] font-display text-[23px] font-semibold text-[#f0f0f0]">
        {value}{" "}
        {suffix && (
          <span className="text-[14px] font-medium text-[#6e6e6e]">{suffix}</span>
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
      className={`rounded-[10px] border border-[#2b2b2b] bg-[#1e1e1e] p-[16px_18px] ${className ?? ""}`}
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
      <span className="font-display text-[14.5px] font-semibold text-[#f0f0f0]">
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
