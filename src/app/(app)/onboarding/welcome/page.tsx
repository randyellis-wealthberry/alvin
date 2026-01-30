"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Clock, Bell, Shield, ArrowRight, CheckCircle2 } from "lucide-react";
import { api } from "~/trpc/react";

const FEATURES = [
  {
    icon: Clock,
    title: "Regular Check-ins",
    description:
      "Stay connected with customizable check-in schedules that work around your life.",
    color: "cyan" as const,
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Your loved ones are automatically notified if you need help, with escalating alerts.",
    color: "purple" as const,
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your data is encrypted and private. You control exactly who gets notified and when.",
    color: "green" as const,
  },
];

const COLOR_MAP = {
  cyan: "bg-cyan-500/20 text-cyan-400",
  purple: "bg-purple-500/20 text-purple-400",
  green: "bg-emerald-500/20 text-emerald-400",
};

const STATS = [
  { value: "24/7", label: "Monitoring" },
  { value: "4-Level", label: "Alert System" },
  { value: "End-to-End", label: "Encryption" },
];

export default function WelcomePage() {
  const router = useRouter();
  const { data: session, update } = useSession();

  const advanceStep = api.profile.advanceOnboardingStep.useMutation();

  const fullName = session?.user?.name;
  const firstName = fullName?.split(" ")[0] ?? "there";

  const handleGetStarted = async () => {
    try {
      await advanceStep.mutateAsync({ step: 1 });
      await update();
      router.push("/onboarding/preferences");
    } catch {
      // Error state is tracked by advanceStep.isError
    }
  };

  return (
    <div className="animate-fade-in w-full max-w-2xl">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        {/* Success badge */}
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Account Created
          </span>
        </div>

        {/* Welcome heading */}
        <h1 className="mb-3 text-center text-3xl font-bold text-white">
          Welcome, {firstName}!
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-8 max-w-lg text-center text-white/60">
          ALVIN is your personal vitality monitoring companion. Here&apos;s what
          you can expect:
        </p>

        {/* Feature cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="animate-fade-in rounded-xl border border-white/10 bg-white/5 p-4"
                style={{
                  animationDelay: `${(i + 1) * 150}ms`,
                  animationFillMode: "both",
                }}
              >
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${COLOR_MAP[feature.color]}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-xs leading-relaxed text-white/50">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick stats */}
        <div className="mb-8 flex items-center justify-around rounded-xl border border-white/10 bg-white/5 px-4 py-5">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-2xl font-bold text-cyan-400">
                {stat.value}
              </span>
              <span className="text-sm text-white/50">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleGetStarted}
          disabled={advanceStep.isPending}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3.5 text-base font-semibold text-white transition-all hover:from-purple-500 hover:to-blue-500 disabled:opacity-50"
        >
          {advanceStep.isPending ? "Starting..." : "Get Started"}
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
        </button>

        {advanceStep.isError && (
          <p className="mt-4 text-center text-sm text-red-400">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
