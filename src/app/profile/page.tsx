import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { ProfileForm } from "./profile-form";
import { Button } from "~/components/ui/button";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // Prefetch profile data for SSR
  void api.profile.get.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
          <h1 className="text-4xl font-bold">Profile Settings</h1>
          <p className="text-lg text-muted-foreground">
            Configure your check-in schedule and preferences
          </p>
          <ProfileForm />

          {/* Passkeys Link */}
          <Button asChild variant="secondary" className="mt-4">
            <Link href="/profile/passkeys">Manage Passkeys &rarr;</Link>
          </Button>
        </div>
      </main>
    </HydrateClient>
  );
}
