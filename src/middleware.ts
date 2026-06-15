import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse, type NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = [
  "/login",
  "/set-password",
  "/forgot-password",
  "/reset-password",
];

const handler = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;
  const role = (req.auth?.user as { role?: string } | undefined)?.role;

  const isPublic =
    pathname === "/" || PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!isLoggedIn && !isPublic) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export default async function middleware(req: NextRequest) {
  try {
    return await (handler as (req: NextRequest) => Promise<NextResponse>)(req);
  } catch (e) {
    // Uszkodzone/przedawnione ciasteczko sesji (np. zły AUTH_SECRET) —
    // czyścimy je i traktujemy użytkownika jako niezalogowanego.
    console.error("[middleware] session error, clearing cookie:", e);
    const { pathname } = req.nextUrl;
    const isPublic =
      pathname === "/" || PUBLIC_PATHS.some((p) => pathname.startsWith(p));
    const response = isPublic
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login", req.nextUrl.origin));
    response.cookies.delete("authjs.session-token");
    response.cookies.delete("__Secure-authjs.session-token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
