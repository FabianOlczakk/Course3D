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

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  visibility: z.enum(["ALL", "ACTIVE", "NEW"]).optional(),
  allowSkip: z.boolean().optional(),
  active: z.boolean().optional(),
  questions: z.array(questionSchema).min(1).optional(),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  const form = await prisma.form.findUnique({
    where: { id: params.id },
    include: {
      questions: { orderBy: { order: "asc" } },
      _count: { select: { responses: true } },
    },
  });
  if (!form) return NextResponse.json({ error: "Nie znaleziono." }, { status: 404 });
  return NextResponse.json({ form });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 }); }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Błąd." }, { status: 400 });
  const { questions, ...formData } = parsed.data;
  const form = await prisma.$transaction(async (tx) => {
    if (questions) {
      await tx.formQuestion.deleteMany({ where: { formId: params.id } });
    }
    return tx.form.update({
      where: { id: params.id },
      data: {
        ...formData,
        ...(questions
          ? {
              questions: {
                create: questions.map((q) => ({
                  text: q.text,
                  type: q.type,
                  options: q.options ? (q.options as string[]) : undefined,
                  required: q.required,
                  order: q.order,
                })),
              },
            }
          : {}),
      },
      include: { questions: true },
    });
  });
  return NextResponse.json({ form });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  await prisma.form.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
