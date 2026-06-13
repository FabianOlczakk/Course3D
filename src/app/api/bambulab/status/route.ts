import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  getBambulabDeviceStatus,
  parsePrinterStatus,
  isMissingTableError,
  type BambulabDevice,
} from "@/lib/bambulab";

// GET: status wybranej drukarki (polling co ~10s po stronie klienta).
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
  if (!conn.selectedDeviceId) {
    return NextResponse.json({ error: "NO_DEVICE" }, { status: 409 });
  }

  const devices = (conn.deviceList as BambulabDevice[] | null) ?? [];
  const device =
    devices.find((d) => d?.dev_id === conn!.selectedDeviceId) ?? null;

  let raw: unknown = null;
  try {
    raw = await getBambulabDeviceStatus(
      conn.accessToken,
      conn.selectedDeviceId
    );
  } catch {
    raw = null;
  }

  const status = parsePrinterStatus(raw, device);
  return NextResponse.json({ status });
}
