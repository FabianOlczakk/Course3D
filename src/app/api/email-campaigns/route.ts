import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const createSchema = z.object({
  subject: z.string().min(1).max(500),
  content: z.string().min(1),
  recipientType: z.enum(["ALL", "NEWSLETTER", "SPECIFIC"]).default("ALL"),
  specificEmails: z.array(z.string().email()).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  const campaigns = await prisma.emailCampaign.findMany({
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { id: true, username: true, email: true } } },
  });
  return NextResponse.json({ campaigns });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 }); }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Błąd." }, { status: 400 });
  const campaign = await prisma.emailCampaign.create({
    data: {
      ...parsed.data,
      specificEmails: parsed.data.specificEmails ? (parsed.data.specificEmails as string[]) : undefined,
      createdById: session.user.id,
    },
  });
  return NextResponse.json({ campaign }, { status: 201 });
}
