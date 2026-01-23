"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  Fingerprint,
  Sparkles,
  TrendingUp,
  Flame,
  Clock,
  Brain,
  Zap,
  Sun,
  MessageCircle,
  Users,
  BarChart3,
  Bell,
  Droplets,
  Moon,
  Footprints,
  Phone,
  Quote,
} from "lucide-react";
import { cn } from "~/lib/utils";

// Animated counter hook
function useAnimatedNumber(target: number, duration = 1000) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(startValue + (target - startValue) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return current;
}

// Staggered animation wrapper
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("animate-reveal", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Glass card component
function GlassCard({
  children,
  className,
  glow,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: "green" | "blue" | "purple" | "amber" | "pink";
}) {
  const glowColors = {
    green: "shadow-emerald-500/10 hover:shadow-emerald-500/20",
    blue: "shadow-blue-500/10 hover:shadow-blue-500/20",
    purple: "shadow-violet-500/10 hover:shadow-violet-500/20",
    amber: "shadow-amber-500/10 hover:shadow-amber-500/20",
    pink: "shadow-pink-500/10 hover:shadow-pink-500/20",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-white/[0.03] backdrop-blur-xl",
        "border border-white/[0.05]",
        "transition-all duration-500",
        glow && `shadow-2xl ${glowColors[glow]}`,
        className,
      )}
    >
      {/* Subtle inner glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
      <div className="relative">{children}</div>
    </div>
  );
}

// Progress bar with animation
function ProgressBar({
  value,
  color,
  delay = 0,
}: {
  value: number;
  color: string;
  delay?: number;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), delay + 100);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-1000 ease-out",
          color,
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

// Mood button component
function MoodButton({
  emoji,
  selected,
  onClick,
}: {
  emoji: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full text-xl",
        "transition-all duration-300 hover:scale-110",
        selected
          ? "scale-110 bg-emerald-500/20 ring-2 ring-emerald-400/50"
          : "bg-white/5 hover:bg-white/10",
      )}
    >
      {emoji}
    </button>
  );
}

interface DashboardProps {
  userName?: string;
}

export function Dashboard({ userName = "there" }: DashboardProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);
  const [selectedMood, setSelectedMood] = useState(4);

  const checkInCount = useAnimatedNumber(3, 1200);
  const streakCount = useAnimatedNumber(7, 1500);

  const handleCheckIn = () => {
    setIsPulsing(false);
    setIsCheckedIn(true);

    // Reset after animation
    setTimeout(() => {
      setIsCheckedIn(false);
      setIsPulsing(true);
    }, 3000);
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Atmospheric background */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0a1e] via-[#1a1035] to-[#0d0815]" />

        {/* Organic blob shapes */}
        <div className="animate-blob absolute top-[-20%] left-[-10%] h-[60%] w-[60%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="animate-blob animation-delay-2000 absolute right-[-10%] bottom-[-10%] h-[50%] w-[50%] rounded-full bg-indigo-600/10 blur-[100px]" />
        <div className="animate-blob animation-delay-4000 absolute top-[40%] right-[-20%] h-[40%] w-[40%] rounded-full bg-fuchsia-600/5 blur-[80px]" />

        {/* Subtle grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative mx-auto w-full max-w-[520px] px-5 pt-6 pb-28">
        {/* Header */}
        <Reveal delay={0}>
          <header className="mb-10 text-center">
            <p className="mb-2 text-xs font-medium tracking-[0.2em] text-white/40 uppercase">
              {getGreeting()}, {userName.split(" ")[0]}
            </p>
            <h1 className="mb-2 text-4xl font-semibold tracking-tight text-white">
              How are you?
            </h1>
            <p className="text-base text-white/50">
              Let ALVIN know you&apos;re okay
            </p>
          </header>
        </Reveal>

        {/* Check-in buttons */}
        <Reveal delay={100}>
          <section className="mb-12">
            <div className="flex flex-col items-center gap-5">
              {/* Main "I'm OK" button */}
              <div className="relative">
                {/* Outer pulse rings */}
                {isPulsing && (
                  <>
                    <div className="animate-ping-slow absolute inset-0 rounded-full bg-emerald-500/20" />
                    <div className="animate-ping-slower absolute inset-[-8px] rounded-full bg-emerald-500/10" />
                  </>
                )}

                {/* Button */}
                <button
                  onClick={handleCheckIn}
                  disabled={isCheckedIn}
                  className={cn(
                    "relative h-36 w-36 rounded-full",
                    "flex flex-col items-center justify-center gap-1",
                    "text-lg font-semibold tracking-tight",
                    "transform transition-all duration-500",
                    "shadow-2xl",
                    isCheckedIn
                      ? "scale-95 bg-emerald-500 text-white shadow-emerald-500/40"
                      : "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white hover:scale-105 hover:shadow-emerald-500/50 active:scale-95",
                    isPulsing && "animate-heartbeat",
                  )}
                >
                  {isCheckedIn ? (
                    <>
                      <Heart className="animate-bounce-once h-8 w-8 fill-current" />
                      <span className="text-sm">Checked in!</span>
                    </>
                  ) : (
                    <>
                      <Heart className="h-8 w-8" />
                      <span>I&apos;m OK</span>
                    </>
                  )}
                </button>
              </div>

              {/* Biometric button */}
              <button
                className={cn(
                  "h-28 w-28 rounded-full",
                  "flex flex-col items-center justify-center gap-1",
                  "border border-white/10 bg-white/[0.03]",
                  "text-white/70 hover:text-white",
                  "transition-all duration-300",
                  "hover:scale-105 hover:border-white/20 hover:bg-white/[0.06]",
                  "active:scale-95",
                )}
              >
                <Fingerprint className="h-7 w-7" />
                <span className="text-xs font-medium">Biometric</span>
              </button>

              {/* Success message */}
              <div
                className={cn(
                  "flex h-6 items-center justify-center",
                  "transition-all duration-500",
                  isCheckedIn
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-2 opacity-0",
                )}
              >
                <p className="flex items-center gap-2 text-sm font-medium text-emerald-400">
                  <Sparkles className="h-4 w-4" />
                  Your contacts know you&apos;re safe
                </p>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Quick Stats */}
        <Reveal delay={200}>
          <GlassCard className="mb-6 p-5" glow="purple">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-white/70">
                Today&apos;s Status
              </h3>
              <Heart className="h-4 w-4 animate-pulse text-emerald-400" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-400 tabular-nums">
                  {checkInCount}
                </p>
                <p className="mt-1 text-[11px] text-white/40">Check-ins</p>
              </div>
              <div className="border-x border-white/5 text-center">
                <p className="text-3xl font-bold text-sky-400 tabular-nums">
                  2h
                </p>
                <p className="mt-1 text-[11px] text-white/40">Since Last</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-violet-400 tabular-nums">
                  {streakCount}
                </p>
                <p className="mt-1 text-[11px] text-white/40">Day Streak</p>
              </div>
            </div>
          </GlassCard>
        </Reveal>

        {/* Wellness Snapshot */}
        <Reveal delay={300}>
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-base font-medium text-white/80">
              <Sun className="h-4 w-4 text-amber-400" />
              Wellness Snapshot
            </h2>
            <div className="space-y-3">
              {/* Mood */}
              <GlassCard className="p-4" glow="green">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10">
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Mood</p>
                      <p className="text-[10px] text-white/40">
                        Updated 2h ago
                      </p>
                    </div>
                  </div>
                  <span className="text-xl">😊</span>
                </div>
                <ProgressBar
                  value={85}
                  color="bg-gradient-to-r from-emerald-500 to-emerald-400"
                  delay={400}
                />
              </GlassCard>

              {/* Physical Health */}
              <GlassCard className="p-4" glow="blue">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/10">
                      <Heart className="h-4 w-4 text-sky-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Physical Health
                      </p>
                      <p className="text-[10px] text-white/40">
                        Updated 5h ago
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-sky-400/10 px-2 py-0.5 text-xs font-medium text-sky-400">
                    Good
                  </span>
                </div>
                <ProgressBar
                  value={75}
                  color="bg-gradient-to-r from-sky-500 to-sky-400"
                  delay={500}
                />
              </GlassCard>

              {/* Mental Clarity */}
              <GlassCard className="p-4" glow="purple">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10">
                      <Brain className="h-4 w-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Mental Clarity
                      </p>
                      <p className="text-[10px] text-white/40">
                        Updated 1h ago
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-violet-400/10 px-2 py-0.5 text-xs font-medium text-violet-400">
                    High
                  </span>
                </div>
                <ProgressBar
                  value={90}
                  color="bg-gradient-to-r from-violet-500 to-violet-400"
                  delay={600}
                />
              </GlassCard>

              {/* Energy */}
              <GlassCard className="p-4" glow="amber">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10">
                      <Zap className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Energy Level
                      </p>
                      <p className="text-[10px] text-white/40">
                        Updated 30m ago
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                    Medium
                  </span>
                </div>
                <ProgressBar
                  value={65}
                  color="bg-gradient-to-r from-amber-500 to-amber-400"
                  delay={700}
                />
              </GlassCard>
            </div>
          </section>
        </Reveal>

        {/* AI Insights */}
        <Reveal delay={400}>
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-base font-medium text-white/80">
              <Sparkles className="h-4 w-4 text-violet-400" />
              AI Insights
            </h2>

            <div className="space-y-3">
              {/* Pattern */}
              <GlassCard className="bg-gradient-to-br from-violet-500/[0.08] to-indigo-500/[0.05] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-500/20">
                    <TrendingUp className="h-4 w-4 text-violet-300" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-white/90">
                      Pattern Detected
                    </p>
                    <p className="text-[13px] leading-relaxed text-white/60">
                      Your check-ins are most consistent in the morning.
                      Consider a 9 AM reminder to maintain your streak.
                    </p>
                    <p className="mt-2 text-[10px] text-white/30">
                      Based on 30 days of data
                    </p>
                  </div>
                </div>
              </GlassCard>

              {/* Trend */}
              <GlassCard className="bg-gradient-to-br from-emerald-500/[0.08] to-teal-500/[0.05] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                    <TrendingUp className="h-4 w-4 text-emerald-300" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-white/90">
                      Wellness Trend
                    </p>
                    <p className="text-[13px] leading-relaxed text-white/60">
                      Your overall wellness score improved{" "}
                      <span className="font-medium text-emerald-400">15%</span>{" "}
                      this week. Great progress!
                    </p>
                    <p className="mt-2 text-[10px] text-white/30">
                      Compared to last week
                    </p>
                  </div>
                </div>
              </GlassCard>

              {/* Achievement */}
              <GlassCard className="bg-gradient-to-br from-amber-500/[0.08] to-orange-500/[0.05] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/20">
                    <Flame className="h-4 w-4 text-amber-300" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-white/90">
                      Achievement Unlocked
                    </p>
                    <p className="text-[13px] leading-relaxed text-white/60">
                      7-day check-in streak! You&apos;re building a healthy
                      habit.
                    </p>
                    <p className="mt-2 text-[10px] text-white/30">
                      Keep it up!
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </section>
        </Reveal>

        {/* Weekly Overview */}
        <Reveal delay={500}>
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-base font-medium text-white/80">
              <BarChart3 className="h-4 w-4 text-sky-400" />
              This Week
            </h2>

            <GlassCard className="mb-4 p-5">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-xs font-medium text-white/50">
                  Check-in Activity
                </p>
                <p className="text-[10px] text-white/30">Last 7 days</p>
              </div>

              {/* Bar chart */}
              <div className="mb-2 flex h-28 items-end justify-between gap-2">
                {[85, 70, 90, 65, 95, 60, 100].map((height, i) => (
                  <div
                    key={i}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div
                      className={cn(
                        "w-full rounded-t transition-all duration-700 ease-out",
                        i === 6
                          ? "bg-gradient-to-t from-emerald-500 to-emerald-400"
                          : "bg-gradient-to-t from-emerald-500/40 to-emerald-400/30",
                      )}
                      style={{
                        height: `${height}%`,
                        transitionDelay: `${600 + i * 100}ms`,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day, i) => (
                    <p
                      key={day}
                      className={cn(
                        "flex-1 text-center text-[10px]",
                        i === 6 ? "font-medium text-white/70" : "text-white/30",
                      )}
                    >
                      {day}
                    </p>
                  ),
                )}
              </div>
            </GlassCard>

            <div className="grid grid-cols-2 gap-3">
              <GlassCard className="p-4">
                <Flame className="mb-2 h-5 w-5 text-orange-400" />
                <p className="text-2xl font-bold text-white tabular-nums">21</p>
                <p className="mt-1 text-[10px] text-white/40">
                  Total Check-ins
                </p>
              </GlassCard>
              <GlassCard className="p-4">
                <Clock className="mb-2 h-5 w-5 text-sky-400" />
                <p className="text-2xl font-bold text-white tabular-nums">
                  3.2
                </p>
                <p className="mt-1 text-[10px] text-white/40">Avg per Day</p>
              </GlassCard>
            </div>
          </section>
        </Reveal>

        {/* Mood Tracker */}
        <Reveal delay={600}>
          <section className="mb-8">
            <h2 className="mb-4 text-base font-medium text-white/80">
              Mood Tracker
            </h2>

            <GlassCard className="p-5">
              <p className="mb-4 text-sm text-white/60">
                How are you feeling today?
              </p>

              <div className="mb-6 flex items-center justify-between">
                {["😢", "😕", "😐", "🙂", "😊"].map((emoji, i) => (
                  <MoodButton
                    key={i}
                    emoji={emoji}
                    selected={selectedMood === i}
                    onClick={() => setSelectedMood(i)}
                  />
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50">This Week</span>
                  <span className="font-medium text-white/80">
                    Mostly Positive
                  </span>
                </div>
                <div className="flex gap-1">
                  {[
                    "emerald",
                    "emerald",
                    "emerald",
                    "amber",
                    "emerald",
                    "emerald",
                    "emerald",
                  ].map((color, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1.5 flex-1 rounded-full transition-all duration-500",
                        color === "emerald" ? "bg-emerald-500" : "bg-amber-400",
                      )}
                      style={{ transitionDelay: `${800 + i * 50}ms` }}
                    />
                  ))}
                </div>
              </div>
            </GlassCard>
          </section>
        </Reveal>

        {/* Quick Actions */}
        <Reveal delay={700}>
          <section className="mb-8">
            <h2 className="mb-4 text-base font-medium text-white/80">
              Quick Actions
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <GlassCard className="group cursor-pointer p-4 transition-all hover:bg-white/[0.05]">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10 transition-transform group-hover:scale-110">
                  <MessageCircle className="h-5 w-5 text-sky-400" />
                </div>
                <p className="text-sm font-medium text-white">Start Chat</p>
                <p className="mt-0.5 text-[10px] text-white/40">
                  Talk to ALVIN
                </p>
              </GlassCard>

              <GlassCard className="group cursor-pointer p-4 transition-all hover:bg-white/[0.05]">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10 transition-transform group-hover:scale-110">
                  <Bell className="h-5 w-5 text-violet-400" />
                </div>
                <p className="text-sm font-medium text-white">Reminders</p>
                <p className="mt-0.5 text-[10px] text-white/40">
                  Manage alerts
                </p>
              </GlassCard>

              <GlassCard className="group cursor-pointer p-4 transition-all hover:bg-white/[0.05]">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 transition-transform group-hover:scale-110">
                  <Users className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-white">Contacts</p>
                <p className="mt-0.5 text-[10px] text-white/40">
                  Emergency list
                </p>
              </GlassCard>

              <GlassCard className="group cursor-pointer p-4 transition-all hover:bg-white/[0.05]">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 transition-transform group-hover:scale-110">
                  <BarChart3 className="h-5 w-5 text-amber-400" />
                </div>
                <p className="text-sm font-medium text-white">Reports</p>
                <p className="mt-0.5 text-[10px] text-white/40">View stats</p>
              </GlassCard>
            </div>
          </section>
        </Reveal>

        {/* Wellness Tips */}
        <Reveal delay={800}>
          <section className="mb-8">
            <h2 className="mb-4 text-base font-medium text-white/80">
              Wellness Tips
            </h2>

            <div className="space-y-3">
              <GlassCard className="bg-gradient-to-br from-cyan-500/[0.06] to-blue-500/[0.04] p-4">
                <div className="flex items-start gap-3">
                  <Droplets className="mt-0.5 h-5 w-5 text-cyan-400" />
                  <div>
                    <p className="mb-1 text-sm font-medium text-white/90">
                      Stay Hydrated
                    </p>
                    <p className="text-[12px] leading-relaxed text-white/50">
                      Drink at least 8 glasses of water daily. Proper hydration
                      improves mood and energy.
                    </p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="bg-gradient-to-br from-emerald-500/[0.06] to-green-500/[0.04] p-4">
                <div className="flex items-start gap-3">
                  <Footprints className="mt-0.5 h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="mb-1 text-sm font-medium text-white/90">
                      Move Regularly
                    </p>
                    <p className="text-[12px] leading-relaxed text-white/50">
                      Take short walks throughout the day. Even 10 minutes
                      boosts mental clarity.
                    </p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="bg-gradient-to-br from-violet-500/[0.06] to-purple-500/[0.04] p-4">
                <div className="flex items-start gap-3">
                  <Moon className="mt-0.5 h-5 w-5 text-violet-400" />
                  <div>
                    <p className="mb-1 text-sm font-medium text-white/90">
                      Quality Sleep
                    </p>
                    <p className="text-[12px] leading-relaxed text-white/50">
                      Aim for 7-9 hours. A consistent bedtime routine leads to
                      better rest.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </section>
        </Reveal>

        {/* Emergency Contact */}
        <Reveal delay={900}>
          <section className="mb-8">
            <GlassCard className="border-rose-500/10 bg-gradient-to-br from-rose-500/[0.08] to-red-500/[0.05] p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/20">
                  <Phone className="h-5 w-5 text-rose-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Need Immediate Help?
                  </p>
                  <p className="text-[10px] text-white/50">
                    We&apos;re here for you 24/7
                  </p>
                </div>
              </div>

              <button className="mb-3 w-full rounded-full bg-rose-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-400">
                Contact Emergency Support
              </button>

              <p className="text-center text-[10px] text-white/40">
                Crisis Hotline: 1-800-273-8255
              </p>
            </GlassCard>
          </section>
        </Reveal>

        {/* Motivational Quote */}
        <Reveal delay={1000}>
          <section className="mb-4">
            <GlassCard className="bg-gradient-to-r from-violet-500/[0.06] via-fuchsia-500/[0.04] to-amber-500/[0.06] p-6 text-center">
              <Quote className="mx-auto mb-3 h-6 w-6 text-white/20" />
              <p className="mb-3 text-[15px] leading-relaxed text-white/80 italic">
                &quot;Your mental health is a priority. Your happiness is
                essential. Your self-care is a necessity.&quot;
              </p>
              <p className="text-[11px] text-white/40">
                Keep going, you&apos;re doing great
              </p>
            </GlassCard>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
