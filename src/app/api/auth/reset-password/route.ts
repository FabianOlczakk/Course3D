import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Hasło musi mieć min. 8 znaków."),
});

// Ustawia nowe hasło na podstawie tokenu resetu (współdzieli pola inviteToken/inviteExpires).
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Nieprawidłowe dane." },
      { status: 400 }
    );
  }

  const { token, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { inviteToken: token },
    select: { id: true, inviteExpires: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Token resetu jest nieprawidłowy." },
      { status: 400 }
    );
  }

  if (!user.inviteExpires || user.inviteExpires < new Date()) {
    return NextResponse.json(
      { error: "Token resetu wygasł." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      emailVerified: new Date(),
      inviteToken: null,
      inviteExpires: null,
    },
  });

  return NextResponse.json({ ok: true });
}
