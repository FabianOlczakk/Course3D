import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-guard";

// Lista kategorii (opcjonalnie filtrowana typem).
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const where =
    type === "POST" || type === "ANNOUNCEMENT"
      ? { type: type as "POST" | "ANNOUNCEMENT" }
      : undefined;

  const categories = await prisma.category.findMany({
    where,
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ categories });
}

const createSchema = z.object({
  name: z.string().trim().min(1, "Nazwa jest wymagana.").max(60),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Kolor musi być w formacie #rrggbb.")
    .optional(),
  type: z.enum(["POST", "ANNOUNCEMENT"]),
});

// Utwórz kategorię (tylko admin).
export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Nieprawidłowe dane." },
      { status: 400 }
    );
  }
  try {
    const category = await prisma.category.create({
      data: {
        name: parsed.data.name,
        color: parsed.data.color ?? "#9d6bff",
        type: parsed.data.type,
      },
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Kategoria o tej nazwie już istnieje." },
      { status: 400 }
    );
  }
}
