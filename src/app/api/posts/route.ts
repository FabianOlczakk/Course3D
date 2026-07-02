import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { attachmentsSchema } from "@/lib/attachments";
import { notifyPostMentions } from "@/lib/notifications";
import { attachMentions, encodeMentions } from "@/lib/mentions";
import { maskActivity } from "@/lib/online-status";

const authorSelect = {
  select: { id: true, username: true, email: true, avatarUrl: true, role: true, lastActiveAt: true, activityPrivate: true },
} as const;
const categorySelect = { select: { id: true, name: true, color: true } } as const;

// Wilson score lower bound — popularność z uwzględnieniem niepewności przy małej liczbie głosów.
function wilsonScore(up: number, down: number): number {
  const n = up + down;
  if (n === 0) return 0;
  const z = 1.96; // 95% confidence
  const p = up / n;
  return (p + (z * z) / (2 * n) - z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n)) / (1 + (z * z) / n);
}

// Kombinowany score: popularność (Wilson) + aktywność (komentarze) + świeżość (decay).
function postScore(up: number, down: number, commentCount: number, createdAt: Date): number {
  const ageHours = (Date.now() - createdAt.getTime()) / 3_600_000;
  const wilson = wilsonScore(up, down);
  const activityBonus = Math.log1p(commentCount) * 0.15;
  const decayFactor = 1 / Math.pow(ageHours + 2, 0.8);
  return (wilson + activityBonus) * decayFactor;
}

// Posty z paginacją kursorową.
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const url = new URL(req.url);
  const cursor = url.searchParams.get("cursor");
  const sort = url.searchParams.get("sort") ?? "popular"; // "popular" | "new"
  const limit = Math.min(
    Math.max(parseInt(url.searchParams.get("limit") ?? "10", 10) || 10, 1),
    50
  );

  // Przy sortowaniu po popularności pobieramy więcej postów, by móc je przesortować.
  const fetchLimit = sort === "popular" ? Math.min(limit * 5, 200) : limit + 1;

  const posts = await prisma.post.findMany({
    take: fetchLimit + 1,
    ...(cursor && sort === "new" ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      author: authorSelect,
      category: categorySelect,
      _count: { select: { comments: true, votes: true } },
      votes: { where: { userId: session.user.id }, select: { value: true }, take: 1 },
    },
  });

  const hasMoreRaw = posts.length > (sort === "popular" ? fetchLimit : limit);
  const rawItems = hasMoreRaw ? posts.slice(0, sort === "popular" ? fetchLimit : limit) : posts;

  // Compute vote counts
  const postIds = rawItems.map((p) => p.id);
  const voteCounts = await prisma.postVote.groupBy({
    by: ["postId", "value"],
    where: { postId: { in: postIds } },
    _count: true,
  });

  const viewerId = session.user.id;
  const viewerIsAdmin = session.user.role === "ADMIN";

  const enriched = rawItems.map((p) => {
    const up = voteCounts.find((v) => v.postId === p.id && v.value === "UP")?._count ?? 0;
    const down = voteCounts.find((v) => v.postId === p.id && v.value === "DOWN")?._count ?? 0;
    const myVote = p.votes[0]?.value ?? null;
    const { votes: _v, ...rest } = p;
    return {
      ...rest,
      author: maskActivity(p.author, viewerId, viewerIsAdmin),
      votes: { up, down, myVote },
      _score: sort === "popular" ? postScore(up, down, p._count.comments, p.createdAt) : 0,
    };
  });

  // Sortowanie i paginacja kursorowa dla trybu "popular"
  let items: typeof enriched;
  let hasMore: boolean;
  let nextCursor: string | null;

  if (sort === "popular") {
    const sorted = [...enriched].sort((a, b) => b._score - a._score);
    const pageNum = parseInt(url.searchParams.get("page") ?? "1", 10);
    const offset = (pageNum - 1) * limit;
    items = sorted.slice(offset, offset + limit);
    hasMore = sorted.length > offset + limit || hasMoreRaw;
    nextCursor = hasMore ? String(pageNum + 1) : null;
  } else {
    hasMore = hasMoreRaw;
    items = enriched.slice(0, limit);
    nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;
  }

  // Usuń wewnętrzny _score z odpowiedzi
  const itemsClean = items.map(({ _score: _s, ...rest }) => rest);

  // Wzmianki: migracja starych @nazwa → znaczniki + mapa ID → użytkownik.
  const { items: withMentions, mentions } = await attachMentions(
    itemsClean.map((p) => ({ id: p.id, content: p.content })),
    (id, content) => prisma.post.update({ where: { id }, data: { content } })
  );
  const contentById = new Map(withMentions.map((i) => [i.id, i.content]));
  const enrichedWithMentions = itemsClean.map((p) => ({
    ...p,
    content: contentById.get(p.id) ?? p.content,
    mentions,
  }));

  return NextResponse.json({ posts: enrichedWithMentions, nextCursor, sort });
}

const createSchema = z.object({
  content: z.string().trim().min(1, "Treść nie może być pusta.").max(10000),
  title: z.string().trim().max(255).optional(),
  categoryId: z.string().optional().nullable(),
  attachments: attachmentsSchema,
});

// Utwórz nowy post.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
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

  // Powiadomienia liczymy z surowej treści (@nazwa), a w bazie zapisujemy
  // treść ze znacznikami @[uid:ID] (trwałe wzmianki).
  const encoded = await encodeMentions(parsed.data.content);

  const post = await prisma.post.create({
    data: {
      authorId: session.user.id,
      content: encoded,
      title: parsed.data.title || null,
      categoryId: parsed.data.categoryId || null,
      attachments: parsed.data.attachments ?? undefined,
    },
    include: {
      author: authorSelect,
      category: categorySelect,
      _count: { select: { comments: true } },
    },
  });

  void notifyPostMentions(session.user.id, post.id, parsed.data.content);

  const { mentions } = await attachMentions([{ id: post.id, content: post.content }]);
  const { author, ...restPost } = post;
  const postWithVotes = {
    ...restPost,
    author: maskActivity(author, session.user.id, session.user.role === "ADMIN"),
    votes: { up: 0, down: 0, myVote: null },
    mentions,
  };
  return NextResponse.json({ post: postWithVotes }, { status: 201 });
}
