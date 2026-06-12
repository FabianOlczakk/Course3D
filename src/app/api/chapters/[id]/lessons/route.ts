import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-guard";

const createSchema = z.object({
  title: z.string().min(1, "Tytuł jest wymagany."),
  description: z.string().nullable().optional(),
  videoUrl: z.string().nullable().optional(),
  contentJson: z.string().nullable().optional(),
  order: z.number().int().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const lessons = await prisma.lesson.findMany({
    where: { chapterId: params.id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ lessons });
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }

  const chapter = await prisma.chapter.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!chapter) {
    return NextResponse.json(
      { error: "Nie znaleziono rozdziału." },
      { status: 404 }
    );
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

  let order = parsed.data.order;
  if (order === undefined) {
    const last = await prisma.lesson.findFirst({
      where: { chapterId: params.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    order = (last?.order ?? 0) + 1;
  }

  const lesson = await prisma.lesson.create({
    data: {
      chapterId: params.id,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      videoUrl: parsed.data.videoUrl ?? null,
      contentJson: parsed.data.contentJson ?? undefined,
      order,
    },
  });

  return NextResponse.json({ lesson }, { status: 201 });
}
