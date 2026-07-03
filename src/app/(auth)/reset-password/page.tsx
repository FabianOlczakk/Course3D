import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Ustaw nowe hasło — Interaktywny Kurs Druku 3D",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  if (!token) {
    return <InvalidToken message="Brak tokenu resetu w adresie." />;
  }

  const user = await prisma.user.findUnique({
    where: { inviteToken: token },
    select: { id: true, inviteExpires: true },
  });

  if (!user) {
    return <InvalidToken message="Token resetu jest nieprawidłowy." />;
  }

  if (!user.inviteExpires || user.inviteExpires < new Date()) {
    return (
      <InvalidToken message="Token resetu wygasł. Poproś o nowy link." />
    );
  }

  return <ResetPasswordForm token={token} />;
}

function InvalidToken({ message }: { message: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nieprawidłowy link</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Link
          href="/forgot-password"
          className="block text-sm text-primary underline"
        >
          Poproś o nowy link
        </Link>
        <Link href="/login" className="block text-sm text-primary underline">
          Wróć do logowania
        </Link>
      </CardContent>
    </Card>
  );
}
