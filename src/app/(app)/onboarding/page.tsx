import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

const STEP_PATHS = [
  "/onboarding/welcome",
  "/onboarding/preferences",
  "/onboarding/contact",
  "/onboarding/complete",
] as const;

export default async function OnboardingPage() {
  const session = await auth();
  const step = session?.user?.onboardingStep ?? 0;
  redirect(STEP_PATHS[step] ?? "/onboarding/welcome");
}
