import { handlers } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

async function withLogging(
  handler: (req: NextRequest) => Promise<Response>,
  req: NextRequest
) {
  let res: Response;
  try {
    res = await handler(req);
  } catch (e) {
    console.error("[auth] handler threw:", e);
    return NextResponse.json({ error: "auth_throw", detail: String(e) }, { status: 500 });
  }

  if (res.status >= 400) {
    const body = await res.clone().text();
    console.error(`[auth] ${req.method} ${res.status}:`, body.slice(0, 600));
    // Jeśli body jest HTML (błąd Next.js), zamień na JSON żeby klient dostał czytelny błąd
    if (body.trimStart().startsWith("<")) {
      return NextResponse.json(
        { error: "auth_error", status: res.status, hint: "Sprawdź logi serwera" },
        { status: res.status }
      );
    }
  }
  return res;
}

export function GET(req: NextRequest) {
  return withLogging(handlers.GET as (req: NextRequest) => Promise<Response>, req);
}

export function POST(req: NextRequest) {
  return withLogging(handlers.POST as (req: NextRequest) => Promise<Response>, req);
}
