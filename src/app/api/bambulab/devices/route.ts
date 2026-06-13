import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getBambulabDevices, isMissingTableError } from "@/lib/bambulab";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  let conn;
  try {
    conn = await prisma.bambulabConnection.findUnique({
      where: { userId: session.user.id },
    });
  } catch (err) {
    if (isMissingTableError(err)) {
      return NextResponse.json({ error: "MISSING_TABLE" }, { status: 503 });
    }
    throw err;
  }

  if (!conn) {
    return NextResponse.json({ error: "NOT_CONNECTED" }, { status: 404 });
  }

  // Odśwież listę urządzeń z API BambuLab
  let devices = (conn.deviceList as unknown[]) ?? [];
  try {
    const fresh = await getBambulabDevices(conn.accessToken);
    devices = fresh.devices ?? [];
    // Zaktualizuj cache
    await prisma.bambulabConnection.update({
      where: { userId: session.user.id },
      data: { deviceList: devices as never },
    });
  } catch {
    // Użyj cache jeśli API niedostępne
  }

  return NextResponse.json({
    devices,
    selectedDeviceId: conn.selectedDeviceId ?? null,
  });
}
