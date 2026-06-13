// Ogłoszenia przechowywane są jako Posty z markerem w polu attachments:
// [{ type: "SYSTEM_ANNOUNCEMENT" }]. Dzięki temu nie trzeba migracji bazy.
export const ANNOUNCEMENT_MARKER = "SYSTEM_ANNOUNCEMENT";

export function isAnnouncement(attachments: unknown): boolean {
  if (!Array.isArray(attachments)) return false;
  return attachments.some(
    (a) =>
      a &&
      typeof a === "object" &&
      (a as { type?: string }).type === ANNOUNCEMENT_MARKER
  );
}
