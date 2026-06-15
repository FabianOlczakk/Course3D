import { NextRequest, NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try { fs.appendFileSync(path.join(process.cwd(), "auth-debug.log"), line); } catch {}
}

export async function POST(req: NextRequest) {
  log("[login] start");
  try {
    const formData = await req.formData();
    const email = (formData.get("email") as string | null)?.toLowerCase() ?? "";
    const password = (formData.get("password") as string | null) ?? "";
    const callbackUrl = (formData.get("callbackUrl") as string | null) || "/dashboard";

    if (!email || !password) {
      return NextResponse.redirect(new URL(`/login?error=invalid`, req.nextUrl.origin));
    }

    log(`[login] looking up: ${email}`);
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true, username: true, role: true, avatarUrl: true },
    });

    log(`[login] user found: ${!!user}`);
    if (!user || !user.passwordHash) {
      return NextResponse.redirect(new URL(`/login?error=invalid`, req.nextUrl.origin));
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    log(`[login] password valid: ${valid}`);
    if (!valid) {
      return NextResponse.redirect(new URL(`/login?error=invalid`, req.nextUrl.origin));
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

    const res = NextResponse.redirect(new URL(callbackUrl, req.nextUrl.origin));
    res.cookies.set(cookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      secure,
    });

    log("[login] redirect with cookie set");
    return res;
  } catch (err) {
    log(`[login] ERROR: ${err}`);
    return NextResponse.redirect(new URL(`/login?error=server`, req.nextUrl.origin));
  }
}
