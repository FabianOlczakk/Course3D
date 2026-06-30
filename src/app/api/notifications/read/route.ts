import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ ids: z.array(z.string()).optional() });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Brak autoryzacji" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { ids } = schema.parse(body);

  await prisma.notification.updateMany({
    where: {
      userId: session.user.id,
      ...(ids?.length ? { id: { in: ids } } : {}),
    },
    data: { read: true },
  });

  return Response.json({ ok: true });
}
