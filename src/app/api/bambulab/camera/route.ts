import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isMissingTableError } from "@/lib/bambulab";

const BAMBU_API = "https://api.bambulab.com";

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

  if (!conn) return NextResponse.json({ error: "NOT_CONNECTED" }, { status: 404 });
  if (!conn.selectedDeviceId) return NextResponse.json({ error: "NO_DEVICE" }, { status: 409 });

  try {
    const res = await fetch(
      `${BAMBU_API}/v1/iot-service/api/user/ttcode?dev_id=${encodeURIComponent(conn.selectedDeviceId)}`,
      { headers: { Authorization: `Bearer ${conn.accessToken}` } }
    );
    if (!res.ok) {
      return NextResponse.json({ available: false });
    }
    const data = await res.json() as Record<string, unknown>;
    const ttcode = data.ttcode as string | undefined;
    const authkey = (data.authkey ?? data.auth_key) as string | undefined;
    const region = data.region as string | undefined;

    if (!ttcode) return NextResponse.json({ available: false });

    // Construct RTSP URL (only works on local/RTSP-capable clients)
    const host = region
      ? `streaming-${region}.bambulab.com`
      : "streaming-us.bambulab.com";
    const rtspUrl = authkey
      ? `rtsps://${authkey}@${host}/${ttcode}`
      : `rtsps://${host}/${ttcode}`;

    return NextResponse.json({ available: true, rtspUrl, ttcode, region });
  } catch {
    return NextResponse.json({ available: false });
  }
}
