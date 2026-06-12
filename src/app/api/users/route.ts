import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { createInvitedUser } from "@/lib/users";

const createSchema = z.object({
  email: z.string().email("Nieprawidłowy adres e-mail."),
  role: z.enum(["ADMIN", "STUDENT"]).optional(),
});

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
      emailVerified: true,
    },
  });

  return NextResponse.json({ users });
}

export async function POST(req: Request) {
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

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Nieprawidłowe dane." },
      { status: 400 }
    );
  }

  try {
    const result = await createInvitedUser(parsed.data);
    // Zawsze zwracamy link zaproszenia — admin może go skopiować
    // jeśli Resend nie dostarczył maila (np. brak własnej domeny).
    return NextResponse.json(
      {
        id: result.id,
        email: result.email,
        inviteUrl: result.inviteUrl,
      },
      { status: 201 }
    );
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Nie udało się utworzyć użytkownika.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
