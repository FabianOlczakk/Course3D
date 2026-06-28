import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { SECRET_KEY } from "@/lib/auth-secret";
import { checkLoginRateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  callbackUrl: z.string().optional(),
});

/** Akceptuje tylko ścieżki względne, blokuje open redirect (//evil.com, ://). */
function safeCallback(url: string | undefined): string {
  if (!url) return "/dashboard";
  if (!url.startsWith("/") || url.startsWith("//") || url.includes("://")) {
    return "/dashboard";
  }
  return url;
}

async function parseBody(
  req: NextRequest
): Promise<{ email: string; password: string; callbackUrl?: string } | null> {
  const qcb = req.nextUrl.searchParams.get("callbackUrl") ?? undefined;
  const ct = req.headers.get("content-type") || "";

  let raw: Record<string, unknown>;
  if (ct.includes("application/json")) {
    raw = await req.json();
  } else {
    const fd = await req.formData();
    raw = {
      email: fd.get("email"),
      password: fd.get("password"),
      callbackUrl: fd.get("callbackUrl") ?? undefined,
    };
  }

  const parsed = bodySchema.safeParse({
    email: raw.email,
    password: raw.password,
    callbackUrl: raw.callbackUrl ?? qcb,
  });
  if (!parsed.success) return null;

  return {
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
    callbackUrl: parsed.data.callbackUrl ?? qcb,
  };
}

export async function POST(req: NextRequest) {
  const host = req.headers.get("host") || req.nextUrl.host;
  const proto =
    req.headers.get("x-forwarded-proto") ||
    req.nextUrl.protocol.replace(":", "") ||
    "http";
  const origin = `${proto}://${host}`;

  const fail = (code: string) =>
    NextResponse.redirect(new URL(`/login?error=${code}`, origin), 302);

  try {
    // Rate limiting per IP — ochrona przed brute-force.
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    if (!checkLoginRateLimit(ip)) {
      return fail("rate_limit");
    }

    const body = await parseBody(req);
    if (!body) return fail("invalid");
    const { email, password, callbackUrl } = body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true, username: true, role: true },
    });

    if (!user || !user.passwordHash) return fail("invalid");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return fail("invalid");

    const secure = origin.startsWith("https:");
    const cookieName = secure
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";

    // Token jest tylko PODPISANY (HS256), więc nie umieszczamy w nim
    // wrażliwych danych (np. email) — payload jest czytelny dla każdego,
    // kto ma cookie.
    const token = await new SignJWT({
      sub: user.id,
      id: user.id,
      name: user.username,
      username: user.username,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(SECRET_KEY);

    const res = NextResponse.redirect(
      new URL(safeCallback(callbackUrl), origin),
      302
    );
    res.cookies.set(cookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      secure,
    });
    return res;
  } catch {
    return fail("server");
  }
}
