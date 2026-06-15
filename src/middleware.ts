import { NextResponse, type NextRequest } from "next/server";
import { decode } from "next-auth/jwt";

const PUBLIC_PATHS = [
  "/login",
  "/set-password",
  "/forgot-password",
  "/reset-password",
];

// NextAuth v5 używa tych nazw ciasteczek
const SECURE_COOKIE = "__Secure-authjs.session-token";
const DEV_COOKIE = "authjs.session-token";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic =
    pathname === "/" || PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  const secret =
    process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "";

  const isSecure = req.nextUrl.protocol === "https:";
  const cookieName = isSecure ? SECURE_COOKIE : DEV_COOKIE;
  const cookieValue =
    req.cookies.get(cookieName)?.value ??
    req.cookies.get(DEV_COOKIE)?.value ??
    req.cookies.get(SECURE_COOKIE)?.value;

  let token: { id?: string; role?: string } | null = null;

  if (cookieValue) {
    try {
      token = await decode({
        token: cookieValue,
        secret,
        salt: cookieName,
      }) as { id?: string; role?: string } | null;
    } catch {
      // Uszkodzone/przedawnione ciasteczko — wyczyść i traktuj jako niezalogowany
      const destination = isPublic
        ? NextResponse.next()
        : (() => {
            const loginUrl = new URL("/login", req.nextUrl.origin);
            loginUrl.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(loginUrl);
          })();
      destination.cookies.delete(SECURE_COOKIE);
      destination.cookies.delete(DEV_COOKIE);
      return destination;
    }
  }

  const isLoggedIn = !!token?.id;
  const role = token?.role;

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
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
