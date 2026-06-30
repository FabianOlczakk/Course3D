// Użytkownik jest "online" jeśli był aktywny w ciągu ostatnich 5 minut.
export function isOnline(lastActiveAt: Date | null | undefined): boolean {
  if (!lastActiveAt) return false;
  return Date.now() - new Date(lastActiveAt).getTime() < 5 * 60 * 1000;
}

// Ukrywa aktywność (lastActiveAt) przed innymi kursantami, gdy użytkownik
// włączył prywatność aktywności. Administrator oraz sam użytkownik widzą zawsze.
// Zwraca obiekt bez pola `activityPrivate` (nie wyciekamy ustawienia).
export function maskActivity<
  T extends {
    id: string;
    lastActiveAt?: Date | string | null;
    activityPrivate?: boolean | null;
  },
>(u: T, viewerId: string, viewerIsAdmin: boolean): Omit<T, "activityPrivate"> {
  const { activityPrivate, ...rest } = u;
  if (activityPrivate && !viewerIsAdmin && u.id !== viewerId) {
    return { ...rest, lastActiveAt: null } as Omit<T, "activityPrivate">;
  }
  return rest as Omit<T, "activityPrivate">;
}

export function OnlineIndicator({ lastActiveAt, className }: {
  lastActiveAt: Date | null | undefined;
  className?: string;
}) {
  // This is a pure function helper used in server components
  return isOnline(lastActiveAt);
}
