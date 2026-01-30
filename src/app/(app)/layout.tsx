import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { AppShell } from "~/components/shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Suppress header and bottom nav during onboarding
  if (!session.user.onboardingCompleted) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
