import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const patchSchema = z.object({
  username: z.string().min(3).max(40).optional(),
  avatarUrl: z.string().max(3_000_000).nullable().optional(),
  progressPrivate: z.boolean().optional(),
  activityPrivate: z.boolean().optional(),
  newsletterConsent: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Nieprawidłowe dane." }, { status: 400 });
  }

  // Fetch old username for mention replacement
  const oldUser = parsed.data.username !== undefined
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { username: true } })
    : null;

  const data: Record<string, unknown> = {};
  if (parsed.data.username !== undefined) data.username = parsed.data.username;
  if (parsed.data.avatarUrl !== undefined) data.avatarUrl = parsed.data.avatarUrl;
  if (parsed.data.progressPrivate !== undefined) data.progressPrivate = parsed.data.progressPrivate;
  if (parsed.data.activityPrivate !== undefined) data.activityPrivate = parsed.data.activityPrivate;
  if (parsed.data.newsletterConsent !== undefined) data.newsletterConsent = parsed.data.newsletterConsent;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Brak zmian." }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { id: true, username: true, avatarUrl: true, email: true },
    });

    // When username changes, update @mentions in all posts and comments
    const oldUsername = oldUser?.username;
    const newUsername = parsed.data.username;
    if (oldUsername && newUsername && oldUsername !== newUsername) {
      const oldMention = `@${oldUsername}`;
      const newMention = `@${newUsername}`;
      await prisma.$executeRaw`UPDATE "Post" SET content = REPLACE(content, ${oldMention}, ${newMention}) WHERE content LIKE ${'%' + oldMention + '%'}`;
      await prisma.$executeRaw`UPDATE "Comment" SET content = REPLACE(content, ${oldMention}, ${newMention}) WHERE content LIKE ${'%' + oldMention + '%'}`;
    }

    return NextResponse.json({ user });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.toLowerCase().includes("unique")) {
      return NextResponse.json({ error: "Ta nazwa użytkownika jest już zajęta." }, { status: 400 });
    }
    return NextResponse.json({ error: "Nie udało się zaktualizować profilu." }, { status: 400 });
  }
}
