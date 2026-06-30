import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/profile/profile-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { PrivacyForm } from "@/components/profile/privacy-form";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, avatarUrl: true, email: true, progressPrivate: true, activityPrivate: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="p-4 md:p-6 mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Profil</h1>
        <p className="text-text-secondary">
          Zarządzaj swoimi danymi i bezpieczeństwem konta.
        </p>
      </div>

      <ProfileForm
        initialUsername={user.username}
        initialAvatarUrl={user.avatarUrl}
        email={user.email}
      />
      <ChangePasswordForm />
      <PrivacyForm initialProgressPrivate={user.progressPrivate ?? false} initialActivityPrivate={user.activityPrivate ?? false} />
    </div>
  );
}
