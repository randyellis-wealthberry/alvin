import Link from "next/link";
import { api, HydrateClient } from "~/trpc/server";
import { SettingsForm } from "./settings-form";
import { Button } from "~/components/ui/button";
import { Key, LogOut } from "lucide-react";

export default async function SettingsPage() {
  // Prefetch profile data for SSR
  void api.profile.get.prefetch();

  return (
    <HydrateClient>
      <div className="min-h-[calc(100vh-8rem)] px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-md">
          {/* Header */}
          <div className="mb-8 text-center sm:mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Settings
            </h1>
            <p className="mt-2 text-base text-white/70 sm:text-lg">
              Configure your check-in preferences
            </p>
          </div>

          <SettingsForm />

          {/* Additional Actions */}
          <div className="mt-8 flex flex-col gap-3">
            <Button
              asChild
              variant="ghost"
              className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white"
            >
              <Link href="/profile/passkeys">
                <Key className="mr-3 h-4 w-4" />
                Manage Passkeys
              </Link>
            </Button>

            <form action="/api/auth/signout" method="POST">
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
