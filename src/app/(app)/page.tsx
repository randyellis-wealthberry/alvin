"use client"

import { useState, useEffect } from "react"
import {
  Heart,
  Sparkles,
  TrendingUp,
  Flame,
  Clock,
  Brain,
  Zap,
  Sun,
  MessageCircle,
  Users,
  ChartBar,
  Bell,
  Droplets,
  Moon,
  Footprints,
  Phone,
  Quote
} from "lucide-react"
import { HeartIcon } from "~/components/ui/heart"
import { FingerprintIcon } from "~/components/ui/fingerprint"
import { cn } from "~/lib/utils"

// Animated counter hook
function useAnimatedNumber(target: number, duration = 1000) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.floor(startValue + (target - startValue) * eased))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [target, duration])

  return current
}

// Staggered animation wrapper
function Reveal({
  children,
  delay = 0,
  className
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <div
      className={cn("animate-reveal", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// Glass card component
function GlassCard({
  children,
  className,
  glow
}: {
  children: React.ReactNode
  className?: string
  glow?: "green" | "blue" | "purple" | "amber" | "pink"
}) {
  const glowColors = {
    green: "shadow-emerald-500/10 hover:shadow-emerald-500/20",
    blue: "shadow-blue-500/10 hover:shadow-blue-500/20",
    purple: "shadow-violet-500/10 hover:shadow-violet-500/20",
    amber: "shadow-amber-500/10 hover:shadow-amber-500/20",
    pink: "shadow-pink-500/10 hover:shadow-pink-500/20",
  }

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl",
      "bg-white/[0.03] backdrop-blur-xl",
      "border border-white/[0.05]",
      "transition-all duration-500",
      glow && `shadow-2xl ${glowColors[glow]}`,
      className
    )}>
      {/* Subtle inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      <div className="relative">{children}</div>
    </div>
  )
}

// Progress bar with animation
function ProgressBar({
  value,
  color,
  delay = 0
}: {
  value: number
  color: string
  delay?: number
}) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), delay + 100)
    return () => clearTimeout(timer)
  }, [value, delay])

  return (
    <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all duration-1000 ease-out", color)}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

// Mood button component
function MoodButton({
  emoji,
  selected,
  onClick
}: {
  emoji: string
  selected?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-11 h-11 rounded-full flex items-center justify-center text-xl",
        "transition-all duration-300 hover:scale-110",
        selected
          ? "bg-emerald-500/20 ring-2 ring-emerald-400/50 scale-110"
          : "bg-white/5 hover:bg-white/10"
      )}
    >
      {emoji}
    </button>
  )
}

export default function DashboardPage() {
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [isPulsing, setIsPulsing] = useState(true)
  const [selectedMood, setSelectedMood] = useState(4)

  const checkInCount = useAnimatedNumber(3, 1200)
  const streakCount = useAnimatedNumber(7, 1500)

  const handleCheckIn = () => {
    setIsPulsing(false)
    setIsCheckedIn(true)

    // Reset after animation
    setTimeout(() => {
      setIsCheckedIn(false)
      setIsPulsing(true)
    }, 3000)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Atmospheric background */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0a1e] via-[#1a1035] to-[#0d0815]" />

        {/* Organic blob shapes */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] right-[-20%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/5 blur-[80px] animate-blob animation-delay-4000" />

        {/* Subtle grain overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Main content */}
      <div className="relative w-full max-w-[520px] mx-auto px-5 pt-8 pb-28">

        {/* Header */}
        <Reveal delay={0}>
          <header className="text-center mb-10">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-white/40 mb-2">
              Welcome back
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-white mb-2">
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
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping-slow" />
                    <div className="absolute inset-[-8px] rounded-full bg-emerald-500/10 animate-ping-slower" />
                  </>
                )}

                {/* Button */}
                <button
                  onClick={handleCheckIn}
                  disabled={isCheckedIn}
                  className={cn(
                    "relative w-36 h-36 rounded-full",
                    "flex flex-col items-center justify-center gap-1",
                    "font-semibold text-lg tracking-tight",
                    "transition-all duration-500 transform",
                    "shadow-2xl",
                    isCheckedIn
                      ? "bg-emerald-500 text-white scale-95 shadow-emerald-500/40"
                      : "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white hover:scale-105 hover:shadow-emerald-500/50 active:scale-95",
                    isPulsing && "animate-heartbeat"
                  )}
                >
                  {isCheckedIn ? (
                    <>
                      <HeartIcon size={32} className="[&_svg]:fill-current animate-bounce-once" />
                      <span className="text-sm">Checked in!</span>
                    </>
                  ) : (
                    <>
                      <HeartIcon size={32} />
                      <span>I&apos;m OK</span>
                    </>
                  )}
                </button>
              </div>

              {/* Biometric button */}
              <button className={cn(
                "w-28 h-28 rounded-full",
                "flex flex-col items-center justify-center gap-1",
                "bg-white/[0.03] border border-white/10",
                "text-white/70 hover:text-white",
                "transition-all duration-300",
                "hover:bg-white/[0.06] hover:scale-105 hover:border-white/20",
                "active:scale-95"
              )}>
                <FingerprintIcon size={28} />
                <span className="text-xs font-medium">Biometric</span>
              </button>

              {/* Success message */}
              <div className={cn(
                "h-6 flex items-center justify-center",
                "transition-all duration-500",
                isCheckedIn ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
              )}>
                <p className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Your contacts know you&apos;re safe
                </p>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Quick Stats */}
        <Reveal delay={200}>
          <GlassCard className="p-5 mb-6" glow="purple">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white/70">Today&apos;s Status</h3>
              <Heart className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-400 tabular-nums">{checkInCount}</p>
                <p className="text-[11px] text-white/40 mt-1">Check-ins</p>
              </div>
              <div className="text-center border-x border-white/5">
                <p className="text-3xl font-bold text-sky-400 tabular-nums">2h</p>
                <p className="text-[11px] text-white/40 mt-1">Since Last</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-violet-400 tabular-nums">{streakCount}</p>
                <p className="text-[11px] text-white/40 mt-1">Day Streak</p>
              </div>
            </div>
          </GlassCard>
        </Reveal>

        {/* Wellness Snapshot */}
        <Reveal delay={300}>
          <section className="mb-8">
            <h2 className="text-base font-medium text-white/80 mb-4 flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              Wellness Snapshot
            </h2>
            <div className="space-y-3">

              {/* Mood */}
              <GlassCard className="p-4" glow="green">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Mood</p>
                      <p className="text-[10px] text-white/40">Updated 2h ago</p>
                    </div>
                  </div>
                  <span className="text-xl">😊</span>
                </div>
                <ProgressBar value={85} color="bg-gradient-to-r from-emerald-500 to-emerald-400" delay={400} />
              </GlassCard>

              {/* Physical Health */}
              <GlassCard className="p-4" glow="blue">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-sky-500/10 flex items-center justify-center">
                      <Heart className="w-4 h-4 text-sky-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Physical Health</p>
                      <p className="text-[10px] text-white/40">Updated 5h ago</p>
                    </div>
                  </div>
                  <span className="text-sky-400 text-xs font-medium px-2 py-0.5 rounded-full bg-sky-400/10">Good</span>
                </div>
                <ProgressBar value={75} color="bg-gradient-to-r from-sky-500 to-sky-400" delay={500} />
              </GlassCard>

              {/* Mental Clarity */}
              <GlassCard className="p-4" glow="purple">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-violet-500/10 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Mental Clarity</p>
                      <p className="text-[10px] text-white/40">Updated 1h ago</p>
                    </div>
                  </div>
                  <span className="text-violet-400 text-xs font-medium px-2 py-0.5 rounded-full bg-violet-400/10">High</span>
                </div>
                <ProgressBar value={90} color="bg-gradient-to-r from-violet-500 to-violet-400" delay={600} />
              </GlassCard>

              {/* Energy */}
              <GlassCard className="p-4" glow="amber">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Energy Level</p>
                      <p className="text-[10px] text-white/40">Updated 30m ago</p>
                    </div>
                  </div>
                  <span className="text-amber-400 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-400/10">Medium</span>
                </div>
                <ProgressBar value={65} color="bg-gradient-to-r from-amber-500 to-amber-400" delay={700} />
              </GlassCard>
            </div>
          </section>
        </Reveal>

        {/* AI Insights */}
        <Reveal delay={400}>
          <section className="mb-8">
            <h2 className="text-base font-medium text-white/80 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              AI Insights
            </h2>

            <div className="space-y-3">
              {/* Pattern */}
              <GlassCard className="p-4 bg-gradient-to-br from-violet-500/[0.08] to-indigo-500/[0.05]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-violet-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/90 mb-1">Pattern Detected</p>
                    <p className="text-[13px] text-white/60 leading-relaxed">
                      Your check-ins are most consistent in the morning. Consider a 9 AM reminder to maintain your streak.
                    </p>
                    <p className="text-[10px] text-white/30 mt-2">Based on 30 days of data</p>
                  </div>
                </div>
              </GlassCard>

              {/* Trend */}
              <GlassCard className="p-4 bg-gradient-to-br from-emerald-500/[0.08] to-teal-500/[0.05]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/90 mb-1">Wellness Trend</p>
                    <p className="text-[13px] text-white/60 leading-relaxed">
                      Your overall wellness score improved <span className="text-emerald-400 font-medium">15%</span> this week. Great progress!
                    </p>
                    <p className="text-[10px] text-white/30 mt-2">Compared to last week</p>
                  </div>
                </div>
              </GlassCard>

              {/* Achievement */}
              <GlassCard className="p-4 bg-gradient-to-br from-amber-500/[0.08] to-orange-500/[0.05]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Flame className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/90 mb-1">Achievement Unlocked</p>
                    <p className="text-[13px] text-white/60 leading-relaxed">
                      7-day check-in streak! You&apos;re building a healthy habit.
                    </p>
                    <p className="text-[10px] text-white/30 mt-2">Keep it up!</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </section>
        </Reveal>

        {/* Weekly Overview */}
        <Reveal delay={500}>
          <section className="mb-8">
            <h2 className="text-base font-medium text-white/80 mb-4 flex items-center gap-2">
              <ChartBar className="w-4 h-4 text-sky-400" />
              This Week
            </h2>

            <GlassCard className="p-5 mb-4">
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs font-medium text-white/50">Check-in Activity</p>
                <p className="text-[10px] text-white/30">Last 7 days</p>
              </div>

              {/* Bar chart */}
              <div className="flex items-end justify-between gap-2 h-28 mb-2">
                {[85, 70, 90, 65, 95, 60, 100].map((height, i) => (
                  <div key={i} className="flex flex-col items-center flex-1 gap-2">
                    <div
                      className={cn(
                        "w-full rounded-t transition-all duration-700 ease-out",
                        i === 6
                          ? "bg-gradient-to-t from-emerald-500 to-emerald-400"
                          : "bg-gradient-to-t from-emerald-500/40 to-emerald-400/30"
                      )}
                      style={{
                        height: `${height}%`,
                        transitionDelay: `${600 + i * 100}ms`
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                  <p key={day} className={cn(
                    "text-[10px] flex-1 text-center",
                    i === 6 ? "text-white/70 font-medium" : "text-white/30"
                  )}>{day}</p>
                ))}
              </div>
            </GlassCard>

            <div className="grid grid-cols-2 gap-3">
              <GlassCard className="p-4">
                <Flame className="w-5 h-5 text-orange-400 mb-2" />
                <p className="text-2xl font-bold text-white tabular-nums">21</p>
                <p className="text-[10px] text-white/40 mt-1">Total Check-ins</p>
              </GlassCard>
              <GlassCard className="p-4">
                <Clock className="w-5 h-5 text-sky-400 mb-2" />
                <p className="text-2xl font-bold text-white tabular-nums">3.2</p>
                <p className="text-[10px] text-white/40 mt-1">Avg per Day</p>
              </GlassCard>
            </div>
          </section>
        </Reveal>

        {/* Mood Tracker */}
        <Reveal delay={600}>
          <section className="mb-8">
            <h2 className="text-base font-medium text-white/80 mb-4">Mood Tracker</h2>

            <GlassCard className="p-5">
              <p className="text-sm text-white/60 mb-4">How are you feeling today?</p>

              <div className="flex justify-between items-center mb-6">
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
                  <span className="text-white/80 font-medium">Mostly Positive</span>
                </div>
                <div className="flex gap-1">
                  {["emerald", "emerald", "emerald", "amber", "emerald", "emerald", "emerald"].map((color, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex-1 h-1.5 rounded-full transition-all duration-500",
                        color === "emerald" ? "bg-emerald-500" : "bg-amber-400"
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
            <h2 className="text-base font-medium text-white/80 mb-4">Quick Actions</h2>

            <div className="grid grid-cols-2 gap-3">
              <GlassCard className="p-4 cursor-pointer hover:bg-white/[0.05] transition-all group">
                <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5 text-sky-400" />
                </div>
                <p className="text-sm font-medium text-white">Start Chat</p>
                <p className="text-[10px] text-white/40 mt-0.5">Talk to ALVIN</p>
              </GlassCard>

              <GlassCard className="p-4 cursor-pointer hover:bg-white/[0.05] transition-all group">
                <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Bell className="w-5 h-5 text-violet-400" />
                </div>
                <p className="text-sm font-medium text-white">Reminders</p>
                <p className="text-[10px] text-white/40 mt-0.5">Manage alerts</p>
              </GlassCard>

              <GlassCard className="p-4 cursor-pointer hover:bg-white/[0.05] transition-all group">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-white">Contacts</p>
                <p className="text-[10px] text-white/40 mt-0.5">Emergency list</p>
              </GlassCard>

              <GlassCard className="p-4 cursor-pointer hover:bg-white/[0.05] transition-all group">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ChartBar className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-sm font-medium text-white">Reports</p>
                <p className="text-[10px] text-white/40 mt-0.5">View stats</p>
              </GlassCard>
            </div>
          </section>
        </Reveal>

        {/* Wellness Tips */}
        <Reveal delay={800}>
          <section className="mb-8">
            <h2 className="text-base font-medium text-white/80 mb-4">Wellness Tips</h2>

            <div className="space-y-3">
              <GlassCard className="p-4 bg-gradient-to-br from-cyan-500/[0.06] to-blue-500/[0.04]">
                <div className="flex items-start gap-3">
                  <Droplets className="w-5 h-5 text-cyan-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white/90 mb-1">Stay Hydrated</p>
                    <p className="text-[12px] text-white/50 leading-relaxed">
                      Drink at least 8 glasses of water daily. Proper hydration improves mood and energy.
                    </p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-4 bg-gradient-to-br from-emerald-500/[0.06] to-green-500/[0.04]">
                <div className="flex items-start gap-3">
                  <Footprints className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white/90 mb-1">Move Regularly</p>
                    <p className="text-[12px] text-white/50 leading-relaxed">
                      Take short walks throughout the day. Even 10 minutes boosts mental clarity.
                    </p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-4 bg-gradient-to-br from-violet-500/[0.06] to-purple-500/[0.04]">
                <div className="flex items-start gap-3">
                  <Moon className="w-5 h-5 text-violet-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white/90 mb-1">Quality Sleep</p>
                    <p className="text-[12px] text-white/50 leading-relaxed">
                      Aim for 7-9 hours. A consistent bedtime routine leads to better rest.
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
            <GlassCard className="p-5 bg-gradient-to-br from-rose-500/[0.08] to-red-500/[0.05] border-rose-500/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Need Immediate Help?</p>
                  <p className="text-[10px] text-white/50">We&apos;re here for you 24/7</p>
                </div>
              </div>

              <button className="w-full py-3 rounded-full bg-rose-500 hover:bg-rose-400 transition-colors font-semibold text-sm text-white mb-3">
                Contact Emergency Support
              </button>

              <p className="text-[10px] text-white/40 text-center">
                Crisis Hotline: 1-800-273-8255
              </p>
            </GlassCard>
          </section>
        </Reveal>

        {/* Motivational Quote */}
        <Reveal delay={1000}>
          <section className="mb-4">
            <GlassCard className="p-6 bg-gradient-to-r from-violet-500/[0.06] via-fuchsia-500/[0.04] to-amber-500/[0.06] text-center">
              <Quote className="w-6 h-6 text-white/20 mx-auto mb-3" />
              <p className="text-[15px] text-white/80 italic leading-relaxed mb-3">
                &quot;Your mental health is a priority. Your happiness is essential. Your self-care is a necessity.&quot;
              </p>
              <p className="text-[11px] text-white/40">
                Keep going, you&apos;re doing great
              </p>
            </GlassCard>
          </section>
        </Reveal>

      </div>
    </div>
  )
}
