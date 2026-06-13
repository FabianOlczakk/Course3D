import { randomBytes } from "crypto";

const INVITE_VALID_DAYS = 7;

export function generateInviteToken() {
  return randomBytes(16).toString("hex"); // 32-znakowy hex
}

export function inviteExpiryDate() {
  const d = new Date();
  d.setDate(d.getDate() + INVITE_VALID_DAYS);
  return d;
}

// Token resetu hasła współdzieli pola inviteToken/inviteExpires,
// ale jest ważny tylko 1 godzinę.
export function generateResetToken() {
  return randomBytes(16).toString("hex"); // 32-znakowy hex
}

export function resetExpiryDate() {
  const d = new Date();
  d.setHours(d.getHours() + 1);
  return d;
}
