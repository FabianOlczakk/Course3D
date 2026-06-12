import { prisma } from "@/lib/prisma";
import { generateInviteToken, inviteExpiryDate } from "@/lib/invite";
import { sendInviteEmail } from "@/lib/mail";
import type { Role } from "@prisma/client";

export interface CreateInvitedUserResult {
  id: string;
  email: string;
  inviteUrl?: string;
}

/**
 * Tworzy konto użytkownika z tokenem zaproszenia i wysyła e-mail.
 * Rzuca błąd, jeśli e-mail już istnieje.
 */
export async function createInvitedUser(params: {
  email: string;
  role?: Role;
}): Promise<CreateInvitedUserResult> {
  const email = params.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Użytkownik z tym adresem e-mail już istnieje.");
  }

  const inviteToken = generateInviteToken();
  const inviteExpires = inviteExpiryDate();

  const user = await prisma.user.create({
    data: {
      email,
      role: params.role ?? "STUDENT",
      inviteToken,
      inviteExpires,
    },
    select: { id: true, email: true },
  });

  const { inviteUrl } = await sendInviteEmail({ to: email, token: inviteToken });

  return { id: user.id, email: user.email, inviteUrl };
}
