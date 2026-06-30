import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { attachmentsSchema } from "@/lib/attachments";
import { notifyPostMentions } from "@/lib/notifications";

const authorSelect = {
  select: { id: true, username: true, email: true, avatarUrl: true, role: true, lastActiveAt: true },
} as const;
const categorySelect = { select: { id: true, name: true, color: true } } as const;

// Posty z paginacją kursorową (najnowsze pierwsze).
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const url = new URL(req.url);
  const cursor = url.searchParams.get("cursor");
  const limit = Math.min(
    Math.max(parseInt(url.searchParams.get("limit") ?? "10", 10) || 10, 1),
    50
  );

  const posts = await prisma.post.findMany({
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      author: authorSelect,
      category: categorySelect,
      _count: { select: { comments: true, votes: true } },
      votes: { where: { userId: session.user.id }, select: { value: true }, take: 1 },
    },
  });

  const visible = posts;
  const hasMore = visible.length > limit;
  const items = hasMore ? visible.slice(0, limit) : visible;
  const nextCursor = hasMore ? items[items.length - 1]?.id : null;

  // Compute vote counts per post
  const postIds = items.map((p) => p.id);
  const voteCounts = await prisma.postVote.groupBy({
    by: ["postId", "value"],
    where: { postId: { in: postIds } },
    _count: true,
  });

  const enriched = items.map((p) => {
    const up = voteCounts.find((v) => v.postId === p.id && v.value === "UP")?._count ?? 0;
    const down = voteCounts.find((v) => v.postId === p.id && v.value === "DOWN")?._count ?? 0;
    const myVote = p.votes[0]?.value ?? null;
    const { votes: _v, ...rest } = p;
    return { ...rest, votes: { up, down, myVote } };
  });

  return NextResponse.json({ posts: enriched, nextCursor });
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

  const post = await prisma.post.create({
    data: {
      authorId: session.user.id,
      content: parsed.data.content,
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

  const postWithVotes = { ...post, votes: { up: 0, down: 0, myVote: null } };
  return NextResponse.json({ post: postWithVotes }, { status: 201 });
}
