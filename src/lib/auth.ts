import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { encode, decode } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";
import { authConfig } from "./auth.config";
import fs from "fs";
import path from "path";

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

function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try {
    fs.appendFileSync(path.join(process.cwd(), "auth-debug.log"), line);
  } catch {}
  console.log(msg);
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  jwt: {
    async encode(params) {
      log("[encode] start");
      try {
        const token = await encode({ ...params, secret });
        log("[encode] success");
        return token;
      } catch (err) {
        log(`[encode] ERROR: ${err}`);
        throw err;
      }
    },
    async decode(params) {
      log("[decode] start");
      try {
        const token = await decode({ ...params, secret });
        log("[decode] success");
        return token;
      } catch (err) {
        log(`[decode] ERROR: ${err}`);
        return null;
      }
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        log("[jwt] first login start");
        token.id = user.id as string;
        token.role = (user as { role: Role }).role;
        token.username = (user as { username: string | null }).username;
        token.picture = (user as { image?: string | null }).image ?? null;
        log("[jwt] all fields set, returning token");
        return token;
      }
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
        } catch (e) {
          log(`[jwt] db refresh error: ${e}`);
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
        log("[authorize] start");
        try {
          const parsed = credentialsSchema.safeParse(rawCredentials);
          if (!parsed.success) {
            log("[authorize] invalid schema");
            return null;
          }

          const { email, password } = parsed.data;
          log(`[authorize] looking up: ${email.toLowerCase()}`);

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

          log(`[authorize] user found: ${!!user}`);

          if (!user || !user.passwordHash) return null;

          const valid = await bcrypt.compare(password, user.passwordHash);
          log(`[authorize] password valid: ${valid}`);

          if (!valid) return null;

          log(`[authorize] SUCCESS: ${email}`);
          return {
            id: user.id,
            email: user.email,
            name: user.username,
            username: user.username,
            role: user.role,
            image: user.avatarUrl,
          };
        } catch (err) {
          log(`[authorize] ERROR: ${err}`);
          return null;
        }
      },
    }),
  ],
});
