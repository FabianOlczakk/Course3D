import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getBambulabDevices, isMissingTableError } from "@/lib/bambulab";

const BAMBU_API = "https://api.bambulab.com";

const connectSchema = z.union([
  z.object({
    mode: z.literal("credentials"),
    account: z.string().min(1),
    password: z.string().min(1),
  }),
  z.object({
    mode: z.literal("verify"),
    tfaKey: z.string().min(1),
    code: z.string().min(1),
  }),
  z.object({
    mode: z.literal("token"),
    accessToken: z.string().min(10),
  }),
]);

async function saveConnection(userId: string, accessToken: string, refreshToken: string | null) {
  let deviceList: unknown = null;
  try {
    const devices = await getBambulabDevices(accessToken);
    deviceList = devices.devices ?? devices ?? null;
  } catch {
    deviceList = null;
  }

  await prisma.bambulabConnection.upsert({
    where: { userId },
    create: { userId, accessToken, refreshToken, deviceList: deviceList ?? undefined },
    update: { accessToken, refreshToken, deviceList: deviceList ?? undefined, selectedDeviceId: null },
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = connectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }

  try {
    if (parsed.data.mode === "credentials") {
      // Krok 1: email + hasło → BambuLab może wymagać kodu weryfikacyjnego
      const res = await fetch(`${BAMBU_API}/v1/user-service/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: parsed.data.account, password: parsed.data.password }),
      });

      const data = await res.json().catch(() => ({})) as Record<string, unknown>;

      if (!res.ok) {
        const msg = (data.message as string) || (data.error as string) || `Błąd ${res.status}`;
        return NextResponse.json({ error: `Błąd logowania: ${msg}` }, { status: 401 });
      }

      // BambuLab może zwrócić "loginType" gdy wymaga kodu 2FA
      const loginType = data.loginType as string | undefined;
      const tfaKey = (data.tfaKey ?? data.tfa_key ?? data.loginToken) as string | undefined;

      if (loginType === "verifyCode" || tfaKey) {
        // Wymagany kod weryfikacyjny — odsyłamy tfaKey do klienta
        return NextResponse.json({
          requiresCode: true,
          tfaKey: tfaKey ?? "",
          message: "BambuLab wysłał kod weryfikacyjny na Twój email. Wpisz go poniżej.",
        });
      }

      // Logowanie bez 2FA — pobierz token
      const token = (data.token ?? data.accessToken) as string | undefined;
      if (!token) {
        return NextResponse.json(
          { error: "BambuLab nie zwróciło tokenu. Spróbuj metody z tokenem JWT." },
          { status: 401 }
        );
      }

      await saveConnection(session.user.id, token, (data.refreshToken as string) ?? null);
      return NextResponse.json({ ok: true });
    }

    if (parsed.data.mode === "verify") {
      // Krok 2: weryfikacja kodem z maila
      const res = await fetch(`${BAMBU_API}/v1/user-service/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tfaKey: parsed.data.tfaKey,
          tfaCode: parsed.data.code,
          loginType: "verifyCode",
        }),
      });

      const data = await res.json().catch(() => ({})) as Record<string, unknown>;

      if (!res.ok) {
        const msg = (data.message as string) || "Nieprawidłowy kod weryfikacyjny.";
        return NextResponse.json({ error: msg }, { status: 401 });
      }

      const token = (data.token ?? data.accessToken) as string | undefined;
      if (!token) {
        return NextResponse.json({ error: "Nieprawidłowy kod." }, { status: 401 });
      }

      await saveConnection(session.user.id, token, (data.refreshToken as string) ?? null);
      return NextResponse.json({ ok: true });
    }

    // Tryb: bezpośredni token JWT
    if (parsed.data.mode === "token") {
      const t = parsed.data.accessToken.trim();
      if (!t.startsWith("eyJ")) {
        return NextResponse.json(
          { error: "To nie jest token JWT BambuLab. Token powinien zaczynać się od 'eyJ'. Sprawdź instrukcję." },
          { status: 400 }
        );
      }
      await saveConnection(session.user.id, t, null);
      return NextResponse.json({ ok: true });
    }
  } catch (err) {
    if (isMissingTableError(err)) {
      return NextResponse.json({ error: "MISSING_TABLE" }, { status: 503 });
    }
    throw err;
  }

  return NextResponse.json({ error: "Nieznany tryb." }, { status: 400 });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }
  try {
    await prisma.bambulabConnection.deleteMany({ where: { userId: session.user.id } });
  } catch (err) {
    if (isMissingTableError(err)) {
      return NextResponse.json({ error: "MISSING_TABLE" }, { status: 503 });
    }
    throw err;
  }
  return NextResponse.json({ ok: true });
}
