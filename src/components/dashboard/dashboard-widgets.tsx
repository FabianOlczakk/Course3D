"use client";

import Link from "next/link";

// Link do pełnej strony wiadomości (dla widgetu na dashboardzie).
export function DashboardMessagesButton() {
  return (
    <Link
      href="/wiadomosci"
      className="text-[12.5px] font-semibold text-[var(--accent-soft)]"
    >
      Zobacz wszystkie
    </Link>
  );
}
