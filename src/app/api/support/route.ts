import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  type: z.enum(["HELP", "BUG", "FEATURE", "OTHER"]),
  message: z.string().min(5).max(2000),
  pageUrl: z.string().max(500),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Brak autoryzacji" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: session.user.id,
      type: parsed.data.type,
      message: parsed.data.message,
      pageUrl: parsed.data.pageUrl,
    },
  });

  return Response.json({ ok: true, id: ticket.id }, { status: 201 });
}
