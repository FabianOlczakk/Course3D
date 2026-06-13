import { AnnouncementsManager } from "@/components/admin/announcements-manager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ogłoszenia | Panel Admina",
};

export default function AdminAnnouncementsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ogłoszenia</h1>
        <p className="text-muted-foreground">
          Twórz i usuwaj ogłoszenia widoczne dla wszystkich użytkowników. Treść
          może zawierać HTML, CSS i JS (renderowana w iframe).
        </p>
      </div>
      <AnnouncementsManager />
    </div>
  );
}
