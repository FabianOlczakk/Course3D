import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SECRET_KEY } from "@/lib/auth-secret";

const PUBLIC = ["/login", "/set-password", "/forgot-password", "/reset-password"];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = pathname === "/" || PUBLIC.some((p) => pathname.startsWith(p));
  const secure = req.nextUrl.protocol === "https:";
  const cookieName = secure ? "__Secure-authjs.session-token" : "authjs.session-token";
  const cookieValue =
    req.cookies.get(cookieName)?.value ??
    req.cookies.get("authjs.session-token")?.value ??
    req.cookies.get("__Secure-authjs.session-token")?.value;

  let role: string | undefined;
  let isLoggedIn = false;

  if (cookieValue) {
    try {
      const { payload } = await jwtVerify(cookieValue, SECRET_KEY);
      if (payload.sub || (payload as Record<string, unknown>).id) {
        isLoggedIn = true;
        role = (payload as Record<string, unknown>).role as string | undefined;
      }
    } catch {
      const res = isPublic
        ? NextResponse.next()
        : NextResponse.redirect(new URL("/login", req.nextUrl.origin));
      res.cookies.delete("__Secure-authjs.session-token");
      res.cookies.delete("authjs.session-token");
      return res;
    }
  }

  if (!isLoggedIn && !isPublic) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
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
