import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isMissingTableError } from "@/lib/bambulab";

const selectSchema = z.object({
  deviceId: z.string().min(1, "Wybierz drukarkę."),
});

// POST: wybierz drukarkę do wyświetlania w panelu.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = selectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane." },
      { status: 400 }
    );
  }

  try {
    await prisma.bambulabConnection.update({
      where: { userId: session.user.id },
      data: { selectedDeviceId: parsed.data.deviceId },
    });
  } catch (err) {
    if (isMissingTableError(err)) {
      return NextResponse.json({ error: "MISSING_TABLE" }, { status: 503 });
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}
