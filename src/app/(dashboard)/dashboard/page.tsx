import { auth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, PlayCircle, Trophy } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const name = session?.user?.username || "Kursancie";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Witaj, {name}!</h1>
        <p className="text-muted-foreground">
          To Twój pulpit kursu druku 3D. Wkrótce pojawią się tutaj lekcje.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Twój kurs</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Druk 3D od podstaw</div>
            <p className="text-xs text-muted-foreground">
              Kurs z drukarką Bambu Lab A1 Mini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Postęp</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">
              Lekcje dostępne wkrótce (Faza 2)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Twój zestaw</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Bambu Lab A1 Mini</div>
            <p className="text-xs text-muted-foreground">
              Drukarka w cenie kursu (999 PLN)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Co dalej?</CardTitle>
          <CardDescription>
            Platforma jest w trakcie budowy. Faza 1 (konta i panel
            administracyjny) jest gotowa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>Faza 2 — System lekcji i odtwarzacz wideo</li>
            <li>Faza 3 — Społeczność i wiadomości</li>
            <li>Faza 4 — Quizy, zadania i certyfikaty</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
