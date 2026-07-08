import { Bell } from "lucide-react";
import { AnnouncementsManager } from "@/components/admin/announcements-manager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ogłoszenia | Panel Admina",
};

export default function AdminAnnouncementsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 md:p-8">
      <div>
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-[var(--accent)]" />
          <h1 className="font-display text-[20px] font-semibold text-[var(--text-primary)]">Ogłoszenia</h1>
        </div>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          Twórz i usuwaj ogłoszenia widoczne dla wszystkich użytkowników. Treść
          może zawierać HTML, CSS i JS (renderowana w iframe).
        </p>
      </div>
      <AnnouncementsManager />
    </div>
  );
}
