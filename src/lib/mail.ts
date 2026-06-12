import { Resend } from "resend";
import { InviteEmail } from "@/emails/invite-email";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM =
  process.env.RESEND_FROM_EMAIL || "Course3D <onboarding@resend.dev>";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXTAUTH_URL ||
  "http://localhost:3000";

export async function sendInviteEmail(params: {
  to: string;
  token: string;
}) {
  const inviteUrl = `${APP_URL}/set-password?token=${params.token}`;

  if (!resend) {
    // Brak klucza API – w trybie deweloperskim wypisujemy link w konsoli.
    console.warn(
      `[mail] RESEND_API_KEY nie ustawiony. Link zaproszenia dla ${params.to}: ${inviteUrl}`
    );
    return { id: "dev-no-resend", inviteUrl };
  }

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: "Zaproszenie do platformy Course3D",
    react: InviteEmail({ inviteUrl }),
  });

  if (error) {
    throw new Error(`Błąd wysyłki e-maila: ${error.message}`);
  }

  return { id: data?.id, inviteUrl };
}
