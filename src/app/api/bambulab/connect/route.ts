import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  bambulabLogin,
  getBambulabDevices,
  isMissingTableError,
} from "@/lib/bambulab";

const connectSchema = z.object({
  account: z.string().min(1, "Podaj email."),
  password: z.string().min(1, "Podaj hasło."),
});

// POST: logowanie do chmury BambuLab i zapis tokenu dostępu (NIE hasła) w DB.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = connectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane." },
      { status: 400 }
    );
  }

  const { account, password } = parsed.data;

  let login;
  try {
    login = await bambulabLogin(account, password);
  } catch {
    return NextResponse.json(
      { error: "Błąd logowania do BambuLab. Sprawdź email i hasło." },
      { status: 401 }
    );
  }

  if (!login.accessToken) {
    return NextResponse.json(
      { error: "BambuLab nie zwróciło tokenu dostępu." },
      { status: 401 }
    );
  }

  // Pobierz listę urządzeń (best-effort) do cache'a.
  let deviceList: unknown = null;
  try {
    const devices = await getBambulabDevices(login.accessToken);
    deviceList = devices.devices ?? devices ?? null;
  } catch {
    deviceList = null;
  }

  try {
    await prisma.bambulabConnection.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        accessToken: login.accessToken,
        refreshToken: login.refreshToken ?? null,
        deviceList: deviceList ?? undefined,
      },
      update: {
        accessToken: login.accessToken,
        refreshToken: login.refreshToken ?? null,
        deviceList: deviceList ?? undefined,
        selectedDeviceId: null,
      },
    });
  } catch (err) {
    if (isMissingTableError(err)) {
      return NextResponse.json({ error: "MISSING_TABLE" }, { status: 503 });
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}

// DELETE: usuń połączenie BambuLab.
export async function DELETE() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  try {
    await prisma.bambulabConnection.deleteMany({
      where: { userId: session.user.id },
    });
  } catch (err) {
    if (isMissingTableError(err)) {
      return NextResponse.json({ error: "MISSING_TABLE" }, { status: 503 });
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}
