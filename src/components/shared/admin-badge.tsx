// Etykieta administratora (fioletowa) wyświetlana obok nazwy użytkownika.
export function AdminBadge({ role }: { role?: string | null }) {
  if (role !== "ADMIN") return null;
  return (
    <span className="rounded px-1.5 py-0.5 text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
      Administrator
    </span>
  );
}
