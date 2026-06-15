import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { encode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const IS_SECURE = process.env.NEXT_PUBLIC_APP_URL?.startsWith("https") ?? true;
const COOKIE_NAME = IS_SECURE
  ? "__Secure-authjs.session-token"
  : "authjs.session-token";

function writeLog(msg: string) {
  try {
    const logPath = path.join(process.cwd(), "login-debug.log");
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);
  } catch {}
  console.log(msg);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();
    writeLog(`[login] attempt: ${normalizedEmail}`);

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

    writeLog(`[login] user found: ${!!user} | hasHash: ${!!user?.passwordHash}`);

    if (!user || !user.passwordHash) {
      writeLog(`[login] FAILED: user not found or no password`);
      return NextResponse.json({ error: "Nieprawidłowy e-mail lub hasło." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    writeLog(`[login] password valid: ${valid}`);

    if (!valid) {
      writeLog(`[login] FAILED: wrong password`);
      return NextResponse.json({ error: "Nieprawidłowy e-mail lub hasło." }, { status: 401 });
    }

    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "";
    writeLog(`[login] secret length: ${secret.length}`);

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

    writeLog(`[login] SUCCESS for ${normalizedEmail}`);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: IS_SECURE,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    return response;
  } catch (err) {
    writeLog(`[login] ERROR: ${err}`);
    return NextResponse.json({ error: "Błąd serwera.", detail: String(err) }, { status: 500 });
  }
}
