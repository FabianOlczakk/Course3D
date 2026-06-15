import { handlers } from "@/lib/auth";
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try { fs.appendFileSync(path.join(process.cwd(), "auth-debug.log"), line); } catch {}
  console.log(msg);
}

export const GET = handlers.GET;

export async function POST(req: NextRequest) {
  log("[route] POST start");
  try {
    const res = await handlers.POST(req);
    log(`[route] POST done, status=${res.status}`);
    return res;
  } catch (err) {
    log(`[route] POST ERROR: ${err}`);
    throw err;
  }
}
