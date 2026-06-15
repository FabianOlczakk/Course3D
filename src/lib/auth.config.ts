import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";
import fs from "fs";
import path from "path";

function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try { fs.appendFileSync(path.join(process.cwd(), "auth-debug.log"), line); } catch {}
  console.log(msg);
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    username: string | null;
    picture?: string | null;
  }
}

export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Pierwsze logowanie — zapisz dane z authorize()
        token.id = user.id as string;
        token.role = (user as { role: Role }).role;
        token.username = (user as { username: string | null }).username;
        token.picture = (user as { image?: string | null }).image ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      log("[session] start");
      try {
        if (session.user) {
          session.user.id = token.id as string;
          (session.user as { role: Role }).role = token.role as Role;
          (session.user as { username: string | null }).username = token.username as string | null;
          session.user.image = token.picture ?? null;
        }
        log("[session] done");
        return session;
      } catch (err) {
        log(`[session] ERROR: ${err}`);
        throw err;
      }
    },
  },
};
