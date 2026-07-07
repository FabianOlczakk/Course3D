import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  const responses = await prisma.formResponse.findMany({
    where: { formId: params.id },
    include: { user: { select: { id: true, username: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ responses });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 }); }
  const parsed = z.object({ answers: z.record(z.any()), skipped: z.boolean().default(false) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Błąd walidacji." }, { status: 400 });
  const existing = await prisma.formResponse.findUnique({ where: { formId_userId: { formId: params.id, userId: session.user.id } } });
  if (existing) return NextResponse.json({ error: "Już wypełniono ten formularz." }, { status: 409 });
  const response = await prisma.formResponse.create({
    data: { formId: params.id, userId: session.user.id, answers: parsed.data.answers, skipped: parsed.data.skipped },
  });
  return NextResponse.json({ response }, { status: 201 });
}
