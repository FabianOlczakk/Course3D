import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const questionSchema = z.object({
  text: z.string().min(1),
  type: z.enum(["TEXT", "TEXTAREA", "NUMBER", "CHECKBOX", "RADIO"]),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(false),
  order: z.number().int(),
});

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  visibility: z.enum(["ALL", "ACTIVE", "NEW"]).default("ALL"),
  allowSkip: z.boolean().default(true),
  active: z.boolean().default(true),
  questions: z.array(questionSchema).min(1),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }
  const forms = await prisma.form.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { questions: true, responses: true } },
    },
  });
  return NextResponse.json({ forms });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 }); }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Błąd walidacji." }, { status: 400 });
  const { questions, ...formData } = parsed.data;
  const form = await prisma.form.create({
    data: {
      ...formData,
      questions: {
        create: questions.map((q) => ({
          text: q.text,
          type: q.type,
          options: q.options ? (q.options as string[]) : undefined,
          required: q.required,
          order: q.order,
        })),
      },
    },
    include: { questions: true, _count: { select: { responses: true } } },
  });
  return NextResponse.json({ form }, { status: 201 });
}
