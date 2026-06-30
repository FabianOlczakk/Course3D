import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }
  const tickets = await prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, username: true, email: true, avatarUrl: true } } },
  });
  return NextResponse.json({ tickets });
}

const patchSchema = z.object({ resolved: z.boolean() });

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Brak id." }, { status: 400 });
  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  const ticket = await prisma.supportTicket.update({
    where: { id },
    data: { resolved: parsed.data.resolved },
    include: { user: { select: { id: true, username: true, email: true, avatarUrl: true } } },
  });
  return NextResponse.json({ ticket });
}

const createSchema = z.object({
  type: z.enum(["HELP", "BUG", "FEATURE"]),
  message: z.string().min(5).max(2000),
  pageUrl: z.string().max(500).default("admin"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  const ticket = await prisma.supportTicket.create({
    data: { userId: session.user.id, ...parsed.data },
    include: { user: { select: { id: true, username: true, email: true, avatarUrl: true } } },
  });
  return NextResponse.json({ ticket }, { status: 201 });
}
