import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const patchSchema = z.object({
  username: z
    .string()
    .min(3, "Nazwa użytkownika musi mieć min. 3 znaki.")
    .max(40, "Nazwa użytkownika jest zbyt długa.")
    .optional(),
  // base64 data URL lub zwykły URL
  avatarUrl: z.string().max(3_000_000).nullable().optional(),
  progressPrivate: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Nieprawidłowe dane." },
      { status: 400 }
    );
  }

  const data: { username?: string; avatarUrl?: string | null; progressPrivate?: boolean } = {};
  if (parsed.data.username !== undefined) data.username = parsed.data.username;
  if (parsed.data.avatarUrl !== undefined) data.avatarUrl = parsed.data.avatarUrl;
  if (parsed.data.progressPrivate !== undefined) data.progressPrivate = parsed.data.progressPrivate;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Brak zmian." }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { id: true, username: true, avatarUrl: true, email: true },
    });
    return NextResponse.json({ user });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Błąd aktualizacji.";
    if (msg.toLowerCase().includes("unique")) {
      return NextResponse.json(
        { error: "Ta nazwa użytkownika jest już zajęta." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Nie udało się zaktualizować profilu." },
      { status: 400 }
    );
  }
}
