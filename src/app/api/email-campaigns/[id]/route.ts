import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const updateSchema = z.object({
  subject: z.string().min(1).max(500).optional(),
  content: z.string().min(1).optional(),
  recipientType: z.enum(["ALL", "NEWSLETTER", "SPECIFIC"]).optional(),
  specificEmails: z.array(z.string().email()).optional(),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  const c = await prisma.emailCampaign.findUnique({
    where: { id: params.id },
    include: { createdBy: { select: { id: true, username: true, email: true } } },
  });
  if (!c) return NextResponse.json({ error: "Nie znaleziono." }, { status: 404 });
  return NextResponse.json({ campaign: c });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  const c = await prisma.emailCampaign.findUnique({ where: { id: params.id }, select: { status: true } });
  if (!c) return NextResponse.json({ error: "Nie znaleziono." }, { status: 404 });
  if (c.status === "SENT") return NextResponse.json({ error: "Nie można edytować wysłanej kampanii." }, { status: 400 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 }); }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Błąd." }, { status: 400 });
  const updated = await prisma.emailCampaign.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ campaign: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  const c = await prisma.emailCampaign.findUnique({ where: { id: params.id }, select: { status: true } });
  if (!c) return NextResponse.json({ error: "Nie znaleziono." }, { status: 404 });
  if (c.status === "SENT") return NextResponse.json({ error: "Nie można usunąć wysłanej kampanii." }, { status: 400 });
  await prisma.emailCampaign.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
