import { NextRequest, NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try { fs.appendFileSync(path.join(process.cwd(), "auth-debug.log"), line); } catch {}
}

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  log("[login] start");
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    const { email, password } = parsed.data;
    log(`[login] looking up: ${email.toLowerCase()}`);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, passwordHash: true, username: true, role: true, avatarUrl: true },
    });

    log(`[login] user found: ${!!user}`);
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    log(`[login] password valid: ${valid}`);
    if (!valid) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "";
    const secure = req.nextUrl.protocol === "https:";
    const cookieName = secure ? "__Secure-authjs.session-token" : "authjs.session-token";

    log("[login] encoding token");
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
      salt: cookieName,
    });
    log("[login] token encoded");

    const res = NextResponse.json({ ok: true });
    const maxAge = 30 * 24 * 60 * 60; // 30 dni
    res.cookies.set(cookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge,
      secure,
    });

    log("[login] cookie set, returning ok");
    return res;
  } catch (err) {
    log(`[login] ERROR: ${err}`);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
