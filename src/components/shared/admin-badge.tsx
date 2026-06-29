// Etykieta administratora (fioletowa) wyświetlana obok nazwy użytkownika.
export function AdminBadge({ role }: { role?: string | null }) {
  if (role !== "ADMIN") return null;
  return (
    <span className="rounded px-1.5 py-0.5 text-xs font-semibold bg-[#9d6bff1a] text-[var(--accent-soft)] border border-[#9d6bff33]">
      Instruktor
    </span>
  );
}
