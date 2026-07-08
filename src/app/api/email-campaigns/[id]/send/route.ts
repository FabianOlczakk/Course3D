import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL || "Interaktywny Kurs Druku 3D <noreply@kurs.magbase.pl>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://kurs.magbase.pl";

const sendSchema = z.object({
  testEmail: z.string().email().optional(), // if present, only send test
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });

  if (!resend) return NextResponse.json({ error: "Resend API nie skonfigurowane." }, { status: 503 });

  let body: unknown;
  try { body = await req.json(); } catch { body = {}; }
  const parsed = sendSchema.safeParse(body);
  const testEmail = parsed.success ? parsed.data.testEmail : undefined;

  const campaign = await prisma.emailCampaign.findUnique({ where: { id: params.id } });
  if (!campaign) return NextResponse.json({ error: "Nie znaleziono kampanii." }, { status: 404 });
  if (campaign.status === "SENT" && !testEmail) return NextResponse.json({ error: "Kampania już wysłana." }, { status: 400 });

  const htmlContent = `
<!DOCTYPE html>
<html lang="pl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden">
    <div style="padding:24px;text-align:center;border-bottom:1px solid #e2e8f0">
      <img src="${APP_URL}/logo.png" alt="Interaktywny Kurs Druku 3D" width="48" height="48" style="display:inline-block;vertical-align:middle" />
      <span style="display:inline-block;vertical-align:middle;margin-left:10px;font-size:18px;font-weight:600;color:#0f172a">Interaktywny kurs 3D</span>
    </div>
    <div style="padding:32px;color:#334155;font-size:15px;line-height:1.6">
      ${campaign.content}
    </div>
    <div style="padding:16px 32px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;text-align:center">
      Interaktywny Kurs Druku 3D — <a href="${APP_URL}" style="color:#7c3aed">kurs.magbase.pl</a>
    </div>
  </div>
</body>
</html>`;

  // Test send
  if (testEmail) {
    await resend.emails.send({ from: FROM, to: testEmail, subject: `[TEST] ${campaign.subject}`, html: htmlContent });
    await prisma.emailCampaign.update({ where: { id: params.id }, data: { testSentTo: testEmail } });
    return NextResponse.json({ ok: true, testSentTo: testEmail });
  }

  // Real send — gather recipients
  let recipients: string[] = [];
  if (campaign.recipientType === "SPECIFIC" && campaign.specificEmails) {
    recipients = campaign.specificEmails as string[];
  } else {
    const where = campaign.recipientType === "NEWSLETTER" ? { newsletterConsent: true } : {};
    const users = await prisma.user.findMany({ where, select: { email: true } });
    recipients = users.map((u) => u.email);
  }

  if (recipients.length === 0) return NextResponse.json({ error: "Brak odbiorców." }, { status: 400 });

  await prisma.emailCampaign.update({ where: { id: params.id }, data: { status: "SENDING" } });

  // Batch send (Resend allows up to 100 per call, but we do individual for now)
  let sent = 0;
  const errors: string[] = [];
  for (const email of recipients) {
    try {
      await resend.emails.send({ from: FROM, to: email, subject: campaign.subject, html: htmlContent });
      sent++;
    } catch (e) {
      errors.push(email);
    }
  }

  await prisma.emailCampaign.update({
    where: { id: params.id },
    data: { status: errors.length === recipients.length ? "FAILED" : "SENT", sentAt: new Date(), recipientCount: sent },
  });

  return NextResponse.json({ ok: true, sent, failed: errors.length });
}
