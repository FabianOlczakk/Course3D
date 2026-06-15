import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { encode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const IS_SECURE = process.env.NEXT_PUBLIC_APP_URL?.startsWith("https") ?? true;
const COOKIE_NAME = IS_SECURE
  ? "__Secure-authjs.session-token"
  : "authjs.session-token";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();
    console.log("[login] attempt:", normalizedEmail);

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        username: true,
        role: true,
        avatarUrl: true,
      },
    });

    console.log("[login] user found:", !!user, "| hasHash:", !!user?.passwordHash);

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Nieprawidłowy e-mail lub hasło." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    console.log("[login] password valid:", valid);
      return NextResponse.json({ error: "Nieprawidłowy e-mail lub hasło." }, { status: 401 });
    }

    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "";

    const token = await encode({
      token: {
        sub: user.id,
        id: user.id,
        email: user.email,
        name: user.username,
        username: user.username,
        role: user.role,
        picture: user.avatarUrl ?? null,
      },
      secret,
      salt: COOKIE_NAME,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: IS_SECURE,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 dni
    });
    return response;
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
