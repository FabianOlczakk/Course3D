import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-guard";

const createSchema = z.object({
  title: z.string().min(1, "Tytuł jest wymagany."),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  order: z.number().int().optional(),
});

// GET — dostępne dla każdego zalogowanego (lista rozdziałów z lekcjami)
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const chapters = await prisma.chapter.findMany({
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, order: true, description: true },
      },
    },
  });

  return NextResponse.json({ chapters });
}

// POST — tylko admin
export async function POST(req: Request) {
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

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Nieprawidłowe dane." },
      { status: 400 }
    );
  }

  let order = parsed.data.order;
  if (order === undefined) {
    const last = await prisma.chapter.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });
    order = (last?.order ?? 0) + 1;
  }

  const chapter = await prisma.chapter.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      iconUrl: parsed.data.icon ?? null,
      order,
    },
  });

  return NextResponse.json({ chapter }, { status: 201 });
}
