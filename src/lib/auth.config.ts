import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    username: string | null;
    picture?: string | null;
  }
}

// Konfiguracja współdzielona. Callbacki jwt/session są zdefiniowane w
// auth.ts (wymagają Prismy = Node runtime), dlatego tu ich nie ma.
export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
};
