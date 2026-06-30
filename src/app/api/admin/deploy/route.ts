import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/admin-guard";
import { appLog, LOG_DIR } from "@/lib/logger";

const DEPLOY_LOG = path.join(LOG_DIR, "deploy.log");

// Możesz nadpisać przez zmienną środowiskową DEPLOY_SCRIPT=ścieżka/do/deploy.sh
const DEPLOY_SCRIPT = process.env.DEPLOY_SCRIPT;

function buildCmd(cwd: string): string {
  if (DEPLOY_SCRIPT && fs.existsSync(DEPLOY_SCRIPT)) {
    return `bash "${DEPLOY_SCRIPT}"`;
  }
  // Domyślna sekwencja: pull → install → build → restart pm2
  return [
    `cd "${cwd}"`,
    "git pull origin main",
    "npm install --omit=dev=false",
    "npm run build",
    "pm2 restart course3d || pm2 start npm --name course3d -- start",
  ].join(" && ");
}

export async function POST() {
  const admin = await requireAdmin();
  if (!admin)
    return Response.json({ error: "Brak dostępu" }, { status: 403 });

  const cwd = process.cwd();
  const cmd = buildCmd(cwd);
  const ts = new Date().toISOString();

  fs.mkdirSync(LOG_DIR, { recursive: true });
  const header = `\n${"=".repeat(60)}\nDEPLOY START  ${ts}\nAdmin: ${admin.user.email}\nCmd: ${cmd}\n${"=".repeat(60)}\n`;
  fs.appendFileSync(DEPLOY_LOG, header);
  appLog("INFO", "deploy", `Deploy started by ${admin.user.email}`);

  // Uruchom w tle — nie blokuj odpowiedzi HTTP
  const child = exec(cmd, { cwd, timeout: 10 * 60 * 1000 }, (err, stdout, stderr) => {
    const endTs = new Date().toISOString();
    const result =
      `STDOUT:\n${stdout || "(brak)"}\n` +
      `STDERR:\n${stderr || "(brak)"}\n` +
      `${"=".repeat(60)}\nDEPLOY ${err ? "FAILED" : "SUCCESS"}  ${endTs}\n` +
      (err ? `Error: ${err.message}\n` : "") +
      `${"=".repeat(60)}\n`;
    fs.appendFileSync(DEPLOY_LOG, result);
    appLog(err ? "ERROR" : "INFO", "deploy", err ? `Deploy failed: ${err.message}` : "Deploy success");
  });

  child.unref(); // Odepnij od procesu Node — nie blokuj restartu

  return Response.json({
    started: true,
    message: "Deploy uruchomiony w tle. Śledź postęp w zakładce Logi deployu.",
  });
}
