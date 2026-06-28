import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  content: z.string().trim().min(1).max(100000).optional(),
  categoryId: z.string().nullable().optional(),
  pinned: z.boolean().optional(),
});

// Edytuj ogłoszenie / przypnij (tylko admin).
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }
  try {
    const announcement = await prisma.announcement.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return NextResponse.json({ announcement });
  } catch {
    return NextResponse.json(
      { error: "Nie udało się zaktualizować ogłoszenia." },
      { status: 400 }
    );
  }
}

// Usuń ogłoszenie (tylko admin).
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }

  try {
    await prisma.announcement.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Nie udało się usunąć ogłoszenia." },
      { status: 400 }
    );
  }
}
