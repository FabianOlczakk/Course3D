import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfileByUsernamePage({
  params,
}: {
  params: { username: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { username: decodeURIComponent(params.username) },
    select: { id: true },
  });

  if (!user) notFound();
  redirect(`/profil/${user.id}`);
}
