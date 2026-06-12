import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SetPasswordForm } from "@/components/auth/set-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  if (!token) {
    return <InvalidToken message="Brak tokenu zaproszenia w adresie." />;
  }

  const user = await prisma.user.findUnique({
    where: { inviteToken: token },
    select: { id: true, inviteExpires: true },
  });

  if (!user) {
    return <InvalidToken message="Token zaproszenia jest nieprawidłowy." />;
  }

  if (!user.inviteExpires || user.inviteExpires < new Date()) {
    return (
      <InvalidToken message="Token zaproszenia wygasł. Skontaktuj się z administratorem." />
    );
  }

  return <SetPasswordForm token={token} />;
}

function InvalidToken({ message }: { message: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nieprawidłowy link</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/login" className="text-sm text-primary underline">
          Wróć do logowania
        </Link>
      </CardContent>
    </Card>
  );
}
