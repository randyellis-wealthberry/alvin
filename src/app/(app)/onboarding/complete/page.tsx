"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CheckCircle2,
  Clock,
  Calendar,
  Users,
  Heart,
  Sparkles,
  ArrowRight,
  Shield,
  Bell,
} from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";

export default function OnboardingCompletePage() {
  const router = useRouter();
  const { update } = useSession();
  const hasAdvanced = useRef(false);

  const advanceStep = api.profile.advanceOnboardingStep.useMutation({
    onSuccess: () => void update(),
  });

  useEffect(() => {
    if (!hasAdvanced.current) {
      hasAdvanced.current = true;
      advanceStep.mutate({ step: 4 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: profile, isLoading: profileLoading } =
    api.profile.get.useQuery();
  const { data: contacts, isLoading: contactsLoading } =
    api.contact.list.useQuery();

  const isLoading = profileLoading || contactsLoading;
  const contactCount = contacts?.length ?? 0;
  const firstContactName = contacts?.[0]?.name;

  const formatTime = (time: string | null | undefined) => {
    if (!time) return null;
    try {
      const [hours, minutes] = time.split(":").map(Number);
      const period = (hours ?? 0) >= 12 ? "PM" : "AM";
      const displayHour = (hours ?? 0) % 12 || 12;
      return `${displayHour}:${String(minutes ?? 0).padStart(2, "0")} ${period}`;
    } catch {
      return time;
    }
  };

  const summaryCards = [
    {
      icon: Clock,
      color: "text-cyan-400",
      bgColor: "bg-cyan-400/10",
      borderColor: "border-cyan-400/20",
      title: profile?.preferredCheckInTime
        ? formatTime(profile.preferredCheckInTime)
        : `Within ${profile?.checkInFrequencyHours ?? 24}h`,
      subtitle: profile?.preferredCheckInTime
        ? "Preferred check-in time"
        : "First check-in window",
    },
    {
      icon: Calendar,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      borderColor: "border-purple-400/20",
      title: `Every ${profile?.checkInFrequencyHours ?? 24} hours`,
      subtitle: profile?.timezone ?? "Local timezone",
    },
    {
      icon: Users,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
      borderColor: "border-emerald-400/20",
      title:
        contactCount > 0
          ? `${contactCount} contact${contactCount !== 1 ? "s" : ""} added`
          : "No contacts yet",
      subtitle: firstContactName ?? "Add one anytime",
    },
  ];

  const tips = [
    {
      icon: Heart,
      text: "Check in regularly to keep your contacts at ease",
    },
    {
      icon: Bell,
      text: "Enable push notifications for timely reminders",
    },
    {
      icon: Shield,
      text: "Add more contacts in Settings for extra safety",
    },
  ];

  return (
    <div className="animate-fade-in flex w-full max-w-2xl flex-col items-center gap-8">
      {/* Success Hero */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-500/20"
          style={{
            boxShadow: "0 0 30px rgba(16,185,129,0.3)",
            animation: "pulse-glow 2s ease-in-out infinite",
          }}
        >
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">
              You&apos;re All Set!
            </h1>
            <Sparkles className="h-5 w-5 text-yellow-400" />
          </div>
          <p className="text-white/60">ALVIN is ready to keep an eye on you.</p>
        </div>
      </div>

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-white/10 bg-white/5"
            />
          ))}
        </div>
      ) : (
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          {summaryCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                style={{
                  animationDelay: `${(i + 1) * 150}ms`,
                  animation: "fade-in-up 0.5s ease-out both",
                }}
              >
                <div className="flex flex-col gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bgColor} ${card.borderColor} border`}
                  >
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{card.title}</p>
                    <p className="text-sm text-white/50">{card.subtitle}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tips Section */}
      <div className="w-full space-y-3">
        <h2 className="text-sm font-medium tracking-wide text-white/40 uppercase">
          Quick Tips to Get Started
        </h2>
        <div className="space-y-2">
          {tips.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg px-1 py-2"
                style={{
                  animationDelay: `${(i + 4) * 150}ms`,
                  animation: "fade-in-up 0.5s ease-out both",
                }}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5">
                  <Icon className="h-4 w-4 text-white/40" />
                </div>
                <p className="text-sm text-white/60">{tip.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-400 hover:shadow-cyan-500/40"
          onClick={() => router.push("/checkin")}
        >
          <Heart className="h-4 w-4" />
          Check In Now
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="flex-1 border border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
          onClick={() => router.push("/")}
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Keyframe styles */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%,
          100% {
            transform: scale(1);
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 50px rgba(16, 185, 129, 0.5);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
