// Użytkownik jest "online" jeśli był aktywny w ciągu ostatnich 5 minut.
export function isOnline(lastActiveAt: Date | null | undefined): boolean {
  if (!lastActiveAt) return false;
  return Date.now() - new Date(lastActiveAt).getTime() < 5 * 60 * 1000;
}

export function OnlineIndicator({ lastActiveAt, className }: {
  lastActiveAt: Date | null | undefined;
  className?: string;
}) {
  // This is a pure function helper used in server components
  return isOnline(lastActiveAt);
}
