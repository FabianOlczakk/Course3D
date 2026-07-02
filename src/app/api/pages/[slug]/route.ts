import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  const page = await prisma.page.findUnique({ where: { slug: params.slug } });
  if (!page) return NextResponse.json({ error: "Nie znaleziono." }, { status: 404 });

  if (page.visibility === "ADMIN" && role !== "ADMIN") {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }
  if (page.visibility === "USERS" && !session?.user) {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }

  return NextResponse.json({ page });
}

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  content: z.string().max(200000).optional(),
  description: z.string().max(500).optional().nullable(),
  visibility: z.enum(["PUBLIC", "USERS", "ADMIN"]).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });

  const page = await prisma.page.update({
    where: { slug: params.slug },
    data: parsed.data,
  });

  return NextResponse.json({ page });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }

  await prisma.page.delete({ where: { slug: params.slug } });
  return NextResponse.json({ ok: true });
}
