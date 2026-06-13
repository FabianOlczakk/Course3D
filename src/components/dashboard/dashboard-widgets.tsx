"use client";

// Przycisk otwierający panel wiadomości (dla widgetu na dashboardzie).
export function DashboardMessagesButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("open-messages"))}
      className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline"
    >
      Otwórz wiadomości →
    </button>
  );
}
