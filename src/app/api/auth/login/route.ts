import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try { fs.appendFileSync(path.join(process.cwd(), "auth-debug.log"), line); } catch {}
}

async function parseBody(req: NextRequest): Promise<{ email: string; password: string; callbackUrl: string }> {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const body = await req.json();
    return {
      email: (body.email as string | undefined)?.toLowerCase() ?? "",
      password: (body.password as string | undefined) ?? "",
      callbackUrl: (body.callbackUrl as string | undefined) || "/dashboard",
    };
  }
  const fd = await req.formData();
  return {
    email: ((fd.get("email") as string | null) ?? "").toLowerCase(),
    password: (fd.get("password") as string | null) ?? "",
    callbackUrl: (fd.get("callbackUrl") as string | null) || "/dashboard",
  };
}

export async function POST(req: NextRequest) {
  log("[login] start");
  try {
    const { email, password, callbackUrl } = await parseBody(req);

    if (!email || !password) {
      return NextResponse.redirect(new URL("/login?error=invalid", req.nextUrl.origin));
    }

    log(`[login] looking up: ${email}`);
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true, username: true, role: true, avatarUrl: true },
    });

    log(`[login] user found: ${!!user}`);
    if (!user || !user.passwordHash) {
      return NextResponse.redirect(new URL("/login?error=invalid", req.nextUrl.origin));
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    log(`[login] password valid: ${valid}`);
    if (!valid) {
      return NextResponse.redirect(new URL("/login?error=invalid", req.nextUrl.origin));
    }

    const rawSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "";
    const secretKey = new TextEncoder().encode(rawSecret);
    const secure = req.nextUrl.protocol === "https:";
    const cookieName = secure ? "__Secure-authjs.session-token" : "authjs.session-token";

    log("[login] signing token");
    const token = await new SignJWT({
      sub: user.id,
      id: user.id,
      email: user.email,
      name: user.username,
      username: user.username,
      role: user.role,
      picture: user.avatarUrl ?? null,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secretKey);

    log("[login] token signed");

    const maxAge = 30 * 24 * 60 * 60;
    const cookieStr = [
      `${cookieName}=${token}`,
      "HttpOnly",
      "SameSite=Lax",
      "Path=/",
      `Max-Age=${maxAge}`,
      ...(secure ? ["Secure"] : []),
    ].join("; ");

    const safeUrl = callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";
    const html = `<!DOCTYPE html><html><head><script>document.cookie=${JSON.stringify(cookieStr)};window.location.replace(${JSON.stringify(safeUrl)});</script></head><body></body></html>`;

    log("[login] returning html redirect");
    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    log(`[login] ERROR: ${err}`);
    return new Response("Błąd serwera", { status: 500 });
  }
}
