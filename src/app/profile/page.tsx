import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // Prefetch profile data for SSR
  void api.profile.get.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
          <h1 className="text-4xl font-bold">Profile Settings</h1>
          <p className="text-lg text-white/70">
            Configure your check-in schedule and preferences
          </p>
          <ProfileForm />
        </div>
      </main>
    </HydrateClient>
  );
}
