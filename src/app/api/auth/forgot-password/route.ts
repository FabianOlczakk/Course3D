import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateResetToken, resetExpiryDate } from "@/lib/invite";
import { sendPasswordResetEmail } from "@/lib/mail";

const schema = z.object({
  email: z.string().email("Nieprawidłowy adres e-mail."),
});

// Generuje token resetu hasła i wysyła e-mail. Zawsze zwraca sukces,
// aby nie ujawniać czy dany e-mail istnieje w bazie.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Nieprawidłowe dane." },
      { status: 400 }
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (user) {
    const inviteToken = generateResetToken();
    const inviteExpires = resetExpiryDate();
    await prisma.user.update({
      where: { id: user.id },
      data: { inviteToken, inviteExpires },
    });
    try {
      await sendPasswordResetEmail({ to: email, token: inviteToken });
    } catch (e) {
      // Nie ujawniaj błędu użytkownikowi, ale zaloguj.
      console.error("[forgot-password] błąd wysyłki:", e);
    }
  }

  return NextResponse.json({ ok: true });
}
