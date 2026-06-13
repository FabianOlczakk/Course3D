// Klient REST API chmury BambuLab (reverse-engineered, na podstawie OrcaSlicer
// i badań społeczności). Używamy podejścia odpytywania (polling) zamiast MQTT.
//
// UWAGA bezpieczeństwa: nigdy nie logujemy ani nie zapisujemy hasła.
// Przechowujemy wyłącznie token dostępu.

const BAMBU_API_BASE = "https://api.bambulab.com";

// Wykrywa błąd Prisma "tabela nie istnieje" (P2021) — tabela BambulabConnection
// może nie być jeszcze utworzona w bazie (wymaga uruchomienia migracji SQL).
export function isMissingTableError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; message?: string };
  if (e.code === "P2021") return true;
  const msg = e.message ?? "";
  return (
    msg.includes("does not exist") &&
    msg.toLowerCase().includes("bambulabconnection")
  );
}

export interface BambulabLoginResult {
  accessToken: string;
  refreshToken?: string;
  [key: string]: unknown;
}

export interface BambulabDevice {
  dev_id: string;
  name: string;
  online: boolean;
  dev_model_name?: string;
  dev_product_name?: string;
  [key: string]: unknown;
}

export async function bambulabLogin(
  account: string,
  password: string
): Promise<BambulabLoginResult> {
  const res = await fetch(`${BAMBU_API_BASE}/v1/user-service/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account, password }),
  });
  if (!res.ok) throw new Error("Błąd logowania do BambuLab");
  return res.json();
}

export async function getBambulabDevices(
  accessToken: string
): Promise<{ devices: BambulabDevice[] }> {
  const res = await fetch(`${BAMBU_API_BASE}/v1/iot-service/api/user/bind`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Nie można pobrać listy urządzeń");
  return res.json();
}

export async function getBambulabDeviceStatus(
  accessToken: string,
  deviceId: string
): Promise<unknown | null> {
  // Próba pobrania statusu urządzenia z chmury.
  const res = await fetch(
    `${BAMBU_API_BASE}/v1/iot-service/api/user/device/bind?dev_id=${encodeURIComponent(
      deviceId
    )}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!res.ok) return null;
  return res.json();
}

// Znormalizowany status drukarki dla UI panelu.
export interface PrinterStatus {
  deviceName: string;
  online: boolean;
  printStatus: string; // np. "RUNNING", "IDLE", "PAUSE", "FINISH"
  fileName: string | null;
  progressPercent: number | null;
  remainingMinutes: number | null;
  nozzleTemp: number | null;
  nozzleTarget: number | null;
  bedTemp: number | null;
  bedTarget: number | null;
}

// Próbuje wyciągnąć użyteczne pola z różnych kształtów odpowiedzi BambuLab.
export function parsePrinterStatus(
  raw: unknown,
  device: BambulabDevice | null
): PrinterStatus {
  const r = (raw ?? {}) as Record<string, unknown>;
  // BambuLab zwraca dane w różnych miejscach; szukamy najbardziej prawdopodobnych.
  const print =
    (r.print as Record<string, unknown>) ??
    (r.device as Record<string, unknown>) ??
    r;

  const num = (v: unknown): number | null =>
    typeof v === "number" && Number.isFinite(v) ? v : null;
  const str = (v: unknown): string | null =>
    typeof v === "string" && v.length > 0 ? v : null;

  return {
    deviceName:
      device?.name ?? str(print.name) ?? str(r.name) ?? "Drukarka BambuLab",
    online: device?.online ?? Boolean(r.online ?? print.online ?? false),
    printStatus:
      str(print.gcode_state) ??
      str(print.print_status) ??
      str(r.print_status) ??
      "UNKNOWN",
    fileName: str(print.subtask_name) ?? str(print.gcode_file) ?? null,
    progressPercent: num(print.mc_percent) ?? num(print.percent),
    remainingMinutes: num(print.mc_remaining_time) ?? num(print.remaining_time),
    nozzleTemp: num(print.nozzle_temper),
    nozzleTarget: num(print.nozzle_target_temper),
    bedTemp: num(print.bed_temper),
    bedTarget: num(print.bed_target_temper),
  };
}

// Tłumaczy surowy status druku na polską etykietę.
export function printStatusLabel(status: string): string {
  switch (status.toUpperCase()) {
    case "RUNNING":
      return "Drukowanie";
    case "PAUSE":
    case "PAUSED":
      return "Wstrzymano";
    case "FINISH":
    case "FINISHED":
      return "Zakończono";
    case "IDLE":
    case "STANDBY":
      return "Bezczynna";
    case "FAILED":
      return "Błąd";
    case "PREPARE":
      return "Przygotowanie";
    default:
      return "Nieznany";
  }
}
