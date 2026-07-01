import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function slug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const createSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  content: z.string().max(200000).default(""),
  description: z.string().max(500).optional(),
  visibility: z.enum(["PUBLIC", "USERS", "ADMIN"]).default("USERS"),
});

export async function GET(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "1";

  if (all && role !== "ADMIN") {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }

  if (all) {
    const pages = await prisma.page.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ pages });
  }

  // Publiczne zapytanie — filtruj według roli
  const visibilities = role === "ADMIN"
    ? ["PUBLIC", "USERS", "ADMIN"]
    : role === "STUDENT"
      ? ["PUBLIC", "USERS"]
      : ["PUBLIC"];

  const pages = await prisma.page.findMany({
    where: { visibility: { in: visibilities as ("PUBLIC" | "USERS" | "ADMIN")[] } },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true, description: true, visibility: true, createdAt: true },
  });

  return NextResponse.json({ pages });
}

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });

  const finalSlug = parsed.data.slug || slug(parsed.data.title);

  const page = await prisma.page.create({
    data: {
      title: parsed.data.title,
      slug: finalSlug,
      content: parsed.data.content,
      description: parsed.data.description,
      visibility: parsed.data.visibility,
    },
  });

  return NextResponse.json({ page }, { status: 201 });
}
