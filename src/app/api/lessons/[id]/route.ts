import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-guard";

const patchSchema = z.object({
  title: z.string().min(1).optional(),
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

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    include: { chapter: { select: { id: true, title: true } } },
  });

  if (!lesson) {
    return NextResponse.json(
      { error: "Nie znaleziono lekcji." },
      { status: 404 }
    );
  }

  return NextResponse.json({ lesson });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Nieprawidłowe dane." },
      { status: 400 }
    );
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) data.title = parsed.data.title;
  if (parsed.data.description !== undefined)
    data.description = parsed.data.description;
  if (parsed.data.videoUrl !== undefined) data.videoUrl = parsed.data.videoUrl;
  if (parsed.data.contentJson !== undefined)
    data.contentJson = parsed.data.contentJson ?? undefined;
  if (parsed.data.order !== undefined) data.order = parsed.data.order;

  try {
    const lesson = await prisma.lesson.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ lesson });
  } catch {
    return NextResponse.json(
      { error: "Nie udało się zaktualizować lekcji." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }

  try {
    await prisma.lesson.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Nie udało się usunąć lekcji." },
      { status: 400 }
    );
  }
}
