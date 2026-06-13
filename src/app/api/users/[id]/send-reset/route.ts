import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { generateResetToken, resetExpiryDate } from "@/lib/invite";
import { sendPasswordResetEmail } from "@/lib/mail";

// Admin generuje link resetu hasła dla użytkownika i wysyła e-mail.
// Zawsze zwraca resetUrl (na wypadek gdyby e-mail nie dotarł).
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, email: true },
  });
  if (!user) {
    return NextResponse.json(
      { error: "Nie znaleziono użytkownika." },
      { status: 404 }
    );
  }

  const inviteToken = generateResetToken();
  const inviteExpires = resetExpiryDate();
  await prisma.user.update({
    where: { id: user.id },
    data: { inviteToken, inviteExpires },
  });

  let emailSent = true;
  let resetUrl: string | undefined;
  try {
    const result = await sendPasswordResetEmail({
      to: user.email,
      token: inviteToken,
    });
    resetUrl = result.resetUrl;
  } catch (e) {
    emailSent = false;
    console.error("[send-reset] błąd wysyłki:", e);
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";

  return NextResponse.json({
    emailSent,
    resetUrl: resetUrl ?? `${appUrl}/reset-password?token=${inviteToken}`,
  });
}
