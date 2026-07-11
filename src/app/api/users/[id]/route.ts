import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

const patchSchema = z.object({
  role: z.enum(["ADMIN", "STUDENT"]).optional(),
  username: z.string().min(3).nullable().optional(),
  email: z.string().email("Nieprawidłowy adres e-mail.").optional(),
  avatarUrl: z.string().nullable().optional(),
  aiTokens: z.number().int().min(0).max(100_000_000).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Nieprawidłowe dane." },
      { status: 400 }
    );
  }

  // Nie pozwól adminowi odebrać sobie roli admina (gdyby był ostatni)
  if (parsed.data.role === "STUDENT" && params.id === session.user.id) {
    const admins = await prisma.user.count({ where: { role: "ADMIN" } });
    if (admins <= 1) {
      return NextResponse.json(
        { error: "Nie można usunąć ostatniego administratora." },
        { status: 400 }
      );
    }
  }

  const data = { ...parsed.data };
  if (data.email) data.email = data.email.trim().toLowerCase();

  try {
    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { id: true, role: true, username: true, email: true, avatarUrl: true, aiTokens: true },
    });
    return NextResponse.json({ user });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Błąd aktualizacji.";
    // Najczęstszy przypadek: zajęta nazwa użytkownika lub e-mail.
    if (msg.includes("Unique") || msg.includes("unique")) {
      return NextResponse.json(
        { error: "Ta nazwa użytkownika lub e-mail są już zajęte." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Nie udało się zaktualizować." }, {
      status: 400,
    });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }

  if (params.id === session.user.id) {
    return NextResponse.json(
      { error: "Nie możesz usunąć własnego konta." },
      { status: 400 }
    );
  }

  try {
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Nie udało się usunąć użytkownika." },
      { status: 400 }
    );
  }
}
