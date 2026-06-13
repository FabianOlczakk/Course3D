// Klient REST API chmury BambuLab (reverse-engineered, na podstawie OrcaSlicer
// i badań społeczności). Używamy podejścia odpytywania (polling) zamiast MQTT.
//
// UWAGA bezpieczeństwa: nigdy nie logujemy ani nie zapisujemy hasła.
// Przechowujemy wyłącznie token dostępu.

const BAMBU_API_BASE = "https://api.bambulab.com";

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
