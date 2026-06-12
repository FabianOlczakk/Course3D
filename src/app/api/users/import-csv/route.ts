import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { createInvitedUser } from "@/lib/users";
import type { Role } from "@prisma/client";

const rowSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "STUDENT"]).optional(),
});

/**
 * Prosty parser CSV: pierwszy wiersz to nagłówki.
 * Obsługiwane kolumny: email (wymagana), role (opcjonalna).
 * Jeśli brak nagłówka "email", traktujemy pierwszą kolumnę jako email.
 */
function parseCsv(text: string): { email: string; role?: string }[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const split = (line: string) =>
    line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));

  const header = split(lines[0]).map((h) => h.toLowerCase());
  const hasHeader = header.includes("email");

  let emailIdx = 0;
  let roleIdx = -1;
  let dataLines = lines;

  if (hasHeader) {
    emailIdx = header.indexOf("email");
    roleIdx = header.indexOf("role");
    dataLines = lines.slice(1);
  }

  return dataLines.map((line) => {
    const cols = split(line);
    return {
      email: cols[emailIdx] ?? "",
      role: roleIdx >= 0 ? cols[roleIdx] : undefined,
    };
  });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }

  const text = await req.text();
  const rows = parseCsv(text);

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Plik CSV jest pusty lub nieprawidłowy." },
      { status: 400 }
    );
  }

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const parsed = rowSchema.safeParse({
      email: row.email,
      role: row.role?.toUpperCase(),
    });

    if (!parsed.success) {
      skipped++;
      errors.push(`Pominięto "${row.email}": nieprawidłowy wiersz.`);
      continue;
    }

    try {
      await createInvitedUser({
        email: parsed.data.email,
        role: parsed.data.role as Role | undefined,
      });
      created++;
    } catch (e) {
      skipped++;
      const msg = e instanceof Error ? e.message : "błąd";
      errors.push(`Pominięto "${parsed.data.email}": ${msg}`);
    }
  }

  return NextResponse.json({ created, skipped, errors });
}
