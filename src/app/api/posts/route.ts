import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { attachmentsSchema } from "@/lib/attachments";


const authorSelect = {
  select: { id: true, username: true, email: true, avatarUrl: true, role: true, lastActiveAt: true },
} as const;

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
      _count: { select: { comments: true } },
    },
  });

  // Odfiltruj ogłoszenia z normalnego feedu społeczności.
  const visible = posts;
  const hasMore = visible.length > limit;
  const items = hasMore ? visible.slice(0, limit) : visible;
  const nextCursor = hasMore ? items[items.length - 1]?.id : null;

  return NextResponse.json({ posts: items, nextCursor });
}

const createSchema = z.object({
  content: z.string().trim().min(1, "Treść nie może być pusta.").max(10000),
  title: z.string().trim().max(255).optional(),
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
      attachments: parsed.data.attachments ?? undefined,
    },
    include: {
      author: authorSelect,
      _count: { select: { comments: true } },
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
