import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { decode, type JWT } from "next-auth/jwt";
import { jwtVerify, SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";
import { authConfig } from "./auth.config";
import { AUTH_SECRET, SECRET_KEY } from "./auth-secret";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      username: string | null;
    } & DefaultSession["user"];
  }
  interface User {
    role: Role;
    username: string | null;
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  jwt: {
    // Token sesji jest podpisywany HS256 (jose) — TEN SAM format co
    // /api/auth/login i middleware. Domyślny encode NextAuth tworzy JWE,
    // którego edge-middleware nie weryfikuje → ciągłe wylogowywanie.
    async encode(params) {
      const t = (params.token ?? {}) as Record<string, unknown>;
      return new SignJWT(t)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(SECRET_KEY);
    },
    async decode(params) {
      if (!params.token) return null;
      try {
        const { payload } = await jwtVerify(params.token, SECRET_KEY);
        return payload as unknown as JWT;
      } catch {
        // Zgodność wsteczna ze starymi tokenami NextAuth (JWE).
        try {
          return await decode({ ...params, secret: AUTH_SECRET });
        } catch {
          return null;
        }
      }
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: Role }).role;
        token.username = (user as { username: string | null }).username;
        // Avatar (base64) NIE trafia do tokenu — powodował ogromne,
        // dzielone na kawałki cookie (HTTP 431).
        token.picture = null;
        return token;
      }
      if (token.id) {
        try {
          const fresh = await prisma.user.findUnique({
            where: { id: token.id },
            select: { role: true, username: true },
          });
          if (fresh) {
            token.role = fresh.role;
            token.username = fresh.username;
          }
        } catch {
          // Brak odświeżenia z DB nie powinien wylogowywać użytkownika.
        }
        token.picture = null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role: Role }).role = token.role as Role;
        (session.user as { username: string | null }).username =
          (token.username as string | null) ?? null;
        // Avatar pobieramy z bazy (Node runtime), nie z tokena.
        try {
          if (token.id) {
            const fresh = await prisma.user.findUnique({
              where: { id: token.id as string },
              select: { avatarUrl: true },
            });
            session.user.image = fresh?.avatarUrl ?? null;
          }
        } catch {
          session.user.image = null;
        }
      }
      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Hasło", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: {
            id: true,
            email: true,
            passwordHash: true,
            username: true,
            role: true,
            avatarUrl: true,
          },
        });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          username: user.username,
          role: user.role,
          image: user.avatarUrl,
        };
      },
    }),
  ],
});
