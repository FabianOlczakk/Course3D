"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");

  const errorMessage =
    error === "invalid"
      ? "Nieprawidłowy e-mail lub hasło."
      : error === "rate_limit"
      ? "Zbyt wiele prób logowania. Spróbuj ponownie za kilka minut."
      : error === "server"
      ? "Błąd połączenia z serwerem."
      : null;

  return (
    <Card>
      <CardHeader className="space-y-3 text-center">
        <div className="flex items-center justify-center gap-2.5">
          <img
            src="/logo.png"
            alt="Interaktywny Kurs Druku 3D"
            className="h-10 w-auto"
            draggable={false}
          />
          <span className="font-display text-lg font-semibold text-[var(--text-primary)]">
            Interaktywny kurs druku 3D
          </span>
        </div>
        <CardDescription>
          Zaloguj się do platformy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form method="POST" action={`/api/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adres e-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="ty@przyklad.pl"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          {errorMessage && (
            <p className="text-sm font-medium text-destructive">{errorMessage}</p>
          )}
          <Button type="submit" className="w-full">
            Zaloguj się
          </Button>
          <p className="text-center text-sm">
            <Link href="/forgot-password" className="text-primary underline">
              Zapomniałeś hasła?
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
