import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-guard";

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
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

  const chapter = await prisma.chapter.findUnique({
    where: { id: params.id },
    include: {
      lessons: { orderBy: { order: "asc" } },
    },
  });

  if (!chapter) {
    return NextResponse.json(
      { error: "Nie znaleziono rozdziału." },
      { status: 404 }
    );
  }

  return NextResponse.json({ chapter });
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
  if (parsed.data.icon !== undefined) data.iconUrl = parsed.data.icon;
  if (parsed.data.order !== undefined) data.order = parsed.data.order;

  try {
    const chapter = await prisma.chapter.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ chapter });
  } catch {
    return NextResponse.json(
      { error: "Nie udało się zaktualizować rozdziału." },
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
    await prisma.chapter.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Nie udało się usunąć rozdziału." },
      { status: 400 }
    );
  }
}
