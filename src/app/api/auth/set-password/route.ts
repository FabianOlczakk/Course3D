import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string().min(1),
  username: z.string().min(3, "Nazwa użytkownika musi mieć min. 3 znaki."),
  password: z.string().min(8, "Hasło musi mieć min. 8 znaków."),
});

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

  const { token, username, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { inviteToken: token },
    select: { id: true, inviteExpires: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Token zaproszenia jest nieprawidłowy." },
      { status: 400 }
    );
  }

  if (!user.inviteExpires || user.inviteExpires < new Date()) {
    return NextResponse.json(
      { error: "Token zaproszenia wygasł." },
      { status: 400 }
    );
  }

  // Sprawdź unikalność nazwy użytkownika
  const taken = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (taken && taken.id !== user.id) {
    return NextResponse.json(
      { error: "Ta nazwa użytkownika jest już zajęta." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      username,
      passwordHash,
      emailVerified: new Date(),
      inviteToken: null,
      inviteExpires: null,
    },
  });

  return NextResponse.json({ ok: true });
}
