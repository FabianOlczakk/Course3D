import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/dashboard/app-shell";
import { StandalonePageView } from "@/components/pages/standalone-page-view";
import { EmbeddedPageView } from "@/components/pages/embedded-page-view";

export const dynamic = "force-dynamic";

export default async function StronaPage({ params }: { params: { slug: string } }) {
  const page = await prisma.page.findUnique({ where: { slug: params.slug } });
  if (!page) notFound();

  if (page.visibility === "PUBLIC") {
    return <StandalonePageView page={page} />;
  }

  // USERS / ADMIN — osadzone w platformie (AppShell sprawdza auth i redirectuje do /login jeśli brak)
  const session = await auth();
  if (!session?.user) {
    // AppShell sam zredirectuje — renderujemy go warunkowo
  }
  if (page.visibility === "ADMIN" && (session?.user as { role?: string } | undefined)?.role !== "ADMIN") {
    notFound();
  }

  return (
    <AppShell>
      <EmbeddedPageView
        page={{
          title: page.title,
          slug: page.slug,
          description: page.description,
          content: page.content,
          visibility: page.visibility as "USERS" | "ADMIN",
          updatedAt: page.updatedAt.toISOString(),
        }}
        isAdmin={(session?.user as { role?: string } | undefined)?.role === "ADMIN"}
      />
    </AppShell>
  );
}
