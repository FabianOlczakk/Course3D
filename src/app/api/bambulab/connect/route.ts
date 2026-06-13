import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  bambulabLogin,
  getBambulabDevices,
  isMissingTableError,
} from "@/lib/bambulab";

const connectSchema = z.union([
  z.object({
    mode: z.literal("credentials"),
    account: z.string().min(1, "Podaj email."),
    password: z.string().min(1, "Podaj hasło."),
  }),
  z.object({
    mode: z.literal("token"),
    accessToken: z.string().min(10, "Token jest za krótki."),
  }),
]);

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

  let accessToken: string;
  let refreshToken: string | null = null;

  if (parsed.data.mode === "credentials") {
    let login;
    try {
      login = await bambulabLogin(parsed.data.account, parsed.data.password);
    } catch {
      return NextResponse.json(
        { error: "Błąd logowania do BambuLab. Sprawdź email i hasło." },
        { status: 401 }
      );
    }
    // BambuLab zwraca "token" lub "accessToken" w zależności od wersji API.
    const rawToken = (login as Record<string, unknown>).token ?? login.accessToken;
    if (!rawToken) {
      return NextResponse.json(
        { error: "BambuLab nie zwróciło tokenu dostępu." },
        { status: 401 }
      );
    }
    accessToken = rawToken as string;
    const rawRefresh = (login as Record<string, unknown>).refreshToken;
    refreshToken = (rawRefresh as string) ?? null;
  } else {
    accessToken = parsed.data.accessToken;
  }

  // Pobierz listę urządzeń (best-effort).
  let deviceList: unknown = null;
  try {
    const devices = await getBambulabDevices(accessToken);
    deviceList = devices.devices ?? devices ?? null;
  } catch {
    deviceList = null;
  }

  try {
    await prisma.bambulabConnection.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        accessToken,
        refreshToken,
        deviceList: deviceList ?? undefined,
      },
      update: {
        accessToken,
        refreshToken,
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
