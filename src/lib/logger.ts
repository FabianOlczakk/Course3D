import fs from "fs";
import path from "path";

const LOG_DIR = process.env.APP_LOG_DIR || path.join(process.cwd(), "logs");
const APP_LOG = path.join(LOG_DIR, "app.log");

export type LogLevel = "INFO" | "WARN" | "ERROR";

export function appLog(level: LogLevel, source: string, message: string) {
  const line = `${new Date().toISOString()} [${level}] [${source}] ${message}\n`;
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.appendFileSync(APP_LOG, line);
  } catch {}
}

export function readLogTail(filePath: string, lines = 300): string[] {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return content.split("\n").filter(Boolean).slice(-lines);
  } catch {
    return [];
  }
}

export { APP_LOG, LOG_DIR };
