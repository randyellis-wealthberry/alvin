"use client";

import { usePathname } from "next/navigation";
import { Heart } from "lucide-react";

const STEPS = [
  { path: "/onboarding/welcome", label: "Welcome" },
  { path: "/onboarding/preferences", label: "Preferences" },
  { path: "/onboarding/contact", label: "Contact" },
  { path: "/onboarding/complete", label: "Complete" },
];

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const currentStepIndex = STEPS.findIndex((s) => pathname.includes(s.path));
  const isComplete = pathname.includes("/complete");

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-indigo-950 to-blue-950" />

      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      <div className="absolute right-1/4 bottom-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-cyan-400" fill="currentColor" />
          <span className="text-lg font-bold tracking-wider text-white">
            ALVIN
          </span>
        </div>

        {/* Step indicator */}
        {!isComplete && currentStepIndex >= 0 && (
          <div className="flex items-center gap-2">
            {STEPS.slice(0, 3).map((step, i) => (
              <div key={step.path} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                    i < currentStepIndex
                      ? "bg-cyan-500 text-white"
                      : i === currentStepIndex
                        ? "border-2 border-cyan-400 bg-cyan-400/20 text-cyan-300"
                        : "border border-white/20 bg-white/5 text-white/40"
                  }`}
                >
                  {i < currentStepIndex ? "✓" : i + 1}
                </div>
                {i < 2 && (
                  <div
                    className={`hidden h-0.5 w-8 sm:block ${
                      i < currentStepIndex ? "bg-cyan-500" : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-12">
        {children}
      </div>
    </div>
  );
}
