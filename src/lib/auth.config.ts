import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: Role }).role;
        token.username = (user as { username: string | null }).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role: Role }).role = token.role as Role;
        (session.user as { username: string | null }).username = token.username as string | null;
      }
      return session;
    },
  },
};
