import { auth } from "~/server/auth";
import { NextResponse } from "next/server";

const ONBOARDING_STEP_PATHS = [
  "/onboarding/welcome",
  "/onboarding/preferences",
  "/onboarding/contact",
  "/onboarding/complete",
] as const;

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;

  // Only process authenticated users on app routes
  if (!session?.user) return;

  const { onboardingCompleted, onboardingStep } = session.user;
  const isOnboardingRoute = nextUrl.pathname.startsWith("/onboarding");

  // Completed users: block re-entry to onboarding
  if (onboardingCompleted && isOnboardingRoute) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Incomplete users visiting non-onboarding app routes: redirect to current step
  if (!onboardingCompleted && !isOnboardingRoute) {
    const targetPath =
      ONBOARDING_STEP_PATHS[onboardingStep] ?? "/onboarding/welcome";
    return NextResponse.redirect(new URL(targetPath, nextUrl));
  }

  // Incomplete users visiting a future onboarding step: redirect to current step
  if (!onboardingCompleted && isOnboardingRoute) {
    const visitingStepIndex = ONBOARDING_STEP_PATHS.findIndex((p) =>
      nextUrl.pathname.startsWith(p),
    );
    // Allow current step and earlier steps (back navigation)
    if (visitingStepIndex > onboardingStep) {
      const correctPath =
        ONBOARDING_STEP_PATHS[onboardingStep] ?? "/onboarding/welcome";
      return NextResponse.redirect(new URL(correctPath, nextUrl));
    }
  }
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|auth|sw\\.js|manifest\\.json|icons).*)",
  ],
};
