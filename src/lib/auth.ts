import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";
import type { JWT } from "next-auth/jwt";
import { authConfig } from "./auth.config";

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
  callbacks: {
    ...authConfig.callbacks,
    // Nadpisujemy jwt: po pierwszym logowaniu zawsze odświeżamy rolę/avatar z DB.
    async jwt({ token, user }) {
      // Pierwsze logowanie — user jest dostępny
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: Role }).role;
        token.username = (user as { username: string | null }).username;
        token.picture = (user as { image?: string | null }).image ?? null;
        return token;
      }
      // Każde kolejne żądanie — odświeżamy dane z DB żeby rola/avatar były aktualne
      if (token.id) {
        try {
          const fresh = await prisma.user.findUnique({
            where: { id: token.id },
            select: { role: true, username: true, avatarUrl: true },
          });
          if (fresh) {
            token.role = fresh.role;
            token.username = fresh.username;
            token.picture = fresh.avatarUrl ?? null;
          }
        } catch {
          // Ignoruj błędy DB — zostają dane z tokenu
        }
      }
      return token;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Hasło", type: "password" },
      },
      async authorize(rawCredentials) {
        try {
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
        } catch (err) {
          console.error("[auth] authorize error:", err);
          return null;
        }
      },
    }),
  ],
});
