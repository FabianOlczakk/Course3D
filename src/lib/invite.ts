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
