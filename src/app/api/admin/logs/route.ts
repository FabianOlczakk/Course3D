import path from "path";
import { requireAdmin } from "@/lib/admin-guard";
import { APP_LOG, LOG_DIR, readLogTail } from "@/lib/logger";

const PM2_OUT =
  process.env.PM2_OUT_LOG ||
  path.join(process.env.HOME || "/root", ".pm2/logs/course3d-out.log");
const PM2_ERR =
  process.env.PM2_ERR_LOG ||
  path.join(process.env.HOME || "/root", ".pm2/logs/course3d-error.log");
const DEPLOY_LOG = path.join(LOG_DIR, "deploy.log");

const SOURCES: Record<string, string> = {
  app: APP_LOG,
  pm2out: PM2_OUT,
  pm2err: PM2_ERR,
  deploy: DEPLOY_LOG,
};

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Brak dostępu" }, { status: 403 });

  const url = new URL(req.url);
  const source = url.searchParams.get("source") ?? "app";
  const filePath = SOURCES[source] ?? APP_LOG;

  const lines = readLogTail(filePath, 400);
  return Response.json({ lines, source, filePath });
}
