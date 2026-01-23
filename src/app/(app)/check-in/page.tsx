"use client"

import { useState, useEffect } from "react"
import { startAuthentication } from "@simplewebauthn/browser"
import Link from "next/link"
import {
  Heart,
  Check,
  Loader2,
  Clock,
  Zap,
  Calendar,
  Sparkles,
  ChevronRight,
  Shield,
  Activity,
  Fingerprint,
  Bell,
  BellRing,
} from "lucide-react"
import { HeartIcon } from "~/components/ui/heart"
import { FingerprintIcon } from "~/components/ui/fingerprint"
import { api } from "~/trpc/react"
import { cn } from "~/lib/utils"

// ─────────────────────────────────────────────────────────────────────────────
// GlassCard Component
// ─────────────────────────────────────────────────────────────────────────────

function GlassCard({
  children,
  className,
  glow,
}: {
  children: React.ReactNode
  className?: string
  glow?: "emerald" | "violet" | "amber" | "rose" | "blue"
}) {
  const glowColors = {
    emerald: "shadow-emerald-500/20",
    violet: "shadow-violet-500/20",
    amber: "shadow-amber-500/20",
    rose: "shadow-rose-500/20",
    blue: "shadow-blue-500/20",
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-white/[0.03] backdrop-blur-xl",
        "border border-white/[0.05]",
        glow && `shadow-2xl ${glowColors[glow]}`,
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      <div className="relative">{children}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function getMethodIcon(method: string) {
  switch (method) {
    case "MANUAL":
      return Heart
    case "BIOMETRIC":
      return Fingerprint
    case "CONVERSATION":
      return Sparkles
    default:
      return Check
  }
}

function getMethodColor(method: string) {
  switch (method) {
    case "MANUAL":
      return "text-emerald-400"
    case "BIOMETRIC":
      return "text-violet-400"
    case "CONVERSATION":
      return "text-blue-400"
    default:
      return "text-white/60"
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Check-In Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function CheckInPage() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [biometricError, setBiometricError] = useState<string | null>(null)
  const [isBiometricLoading, setIsBiometricLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("default")
  const [isEnablingNotifications, setIsEnablingNotifications] = useState(false)
  const utils = api.useUtils()

  useEffect(() => {
    setMounted(true)
    // Check notification permission on mount
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission)
    } else {
      setNotificationPermission("unsupported")
    }
  }, [])

  const handleEnableNotifications = async () => {
    if (!("Notification" in window)) return

    setIsEnablingNotifications(true)
    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
    } finally {
      setIsEnablingNotifications(false)
    }
  }

  // Check if user has passkeys registered
  const { data: hasPasskeys } = api.passkey.hasPasskeys.useQuery()

  // Get check-in history
  const { data: checkIns, isLoading: historyLoading } = api.checkIn.list.useQuery()

  // Manual check-in mutation
  const recordCheckIn = api.checkIn.record.useMutation({
    onSuccess: () => {
      setShowSuccess(true)
      void utils.checkIn.list.invalidate()
    },
  })

  // Biometric check-in mutations
  const generateAuthOptions = api.passkey.generateAuthenticationOptions.useMutation()
  const verifyAuth = api.passkey.verifyAuthentication.useMutation({
    onSuccess: () => {
      setShowSuccess(true)
      void utils.checkIn.list.invalidate()
      void utils.passkey.hasPasskeys.invalidate()
    },
  })

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showSuccess])

  const handleBiometricCheckIn = async () => {
    setBiometricError(null)
    setIsBiometricLoading(true)

    try {
      const options = await generateAuthOptions.mutateAsync()
      let authResponse
      try {
        authResponse = await startAuthentication(options)
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === "NotAllowedError") {
            setBiometricError("Authentication cancelled")
            return
          }
          setBiometricError(err.message)
          return
        }
        setBiometricError("Authentication failed")
        return
      }
      await verifyAuth.mutateAsync({ response: authResponse })
    } catch (err) {
      setBiometricError(err instanceof Error ? err.message : "Check-in failed")
    } finally {
      setIsBiometricLoading(false)
    }
  }

  const isPending = recordCheckIn.isPending || isBiometricLoading

  // Calculate stats from check-ins
  const todayCheckIns = checkIns?.filter((c) => {
    const date = new Date(c.performedAt)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }).length ?? 0

  const lastCheckIn = checkIns?.[0]
  const timeSinceLastCheckIn = lastCheckIn
    ? formatRelativeTime(new Date(lastCheckIn.performedAt))
    : "Never"

  // Calculate streak (simplified)
  const streak = Math.min(checkIns?.length ?? 0, 30)

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#1a0533] via-[#2e026d] to-[#15162c]">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-violet-500/15 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 px-4 pt-8 pb-32">
        <div className="mx-auto max-w-md">
          {/* Header */}
          <div
            className={cn(
              "text-center mb-8 transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <p className="text-xs font-medium tracking-[0.2em] text-emerald-400/80 uppercase mb-2">
              Wellness Check
            </p>
            <h1 className="text-3xl font-bold text-white mb-2">
              {showSuccess ? "You're All Set!" : "How Are You?"}
            </h1>
            <p className="text-white/60 text-sm">
              {showSuccess
                ? "Your contacts know you're safe"
                : "Let your loved ones know you're okay"}
            </p>
          </div>

          {/* Main Check-In Button */}
          <div
            className={cn(
              "flex flex-col items-center mb-8 transition-all duration-700 delay-100",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            {/* Primary I'm OK Button */}
            <button
              onClick={() => recordCheckIn.mutate()}
              disabled={isPending || showSuccess}
              className={cn(
                "relative group",
                "w-40 h-40 rounded-full",
                "transition-all duration-500",
                showSuccess
                  ? "bg-gradient-to-br from-emerald-400 to-emerald-600 scale-110"
                  : "bg-gradient-to-br from-emerald-400 to-emerald-600",
                "shadow-2xl shadow-emerald-500/40",
                "hover:shadow-emerald-500/60 hover:scale-105",
                "active:scale-95",
                "disabled:opacity-70 disabled:cursor-not-allowed",
                !showSuccess && !isPending && "animate-heartbeat"
              )}
            >
              {/* Outer Glow Ring */}
              <div
                className={cn(
                  "absolute -inset-4 rounded-full",
                  "bg-emerald-500/20 blur-xl",
                  "transition-all duration-500",
                  showSuccess && "bg-emerald-400/30 -inset-6"
                )}
              />

              {/* Pulse Rings */}
              {!showSuccess && !isPending && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400/30 animate-ping-slow" />
                  <div className="absolute inset-0 rounded-full border border-emerald-400/20 animate-ping-slower" />
                </>
              )}

              {/* Button Content */}
              <div className="relative flex flex-col items-center justify-center h-full">
                {isPending ? (
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                ) : showSuccess ? (
                  <>
                    <Check className="w-16 h-16 text-white animate-bounce-once" strokeWidth={3} />
                    <span className="text-white/90 text-sm font-medium mt-1">Checked In!</span>
                  </>
                ) : (
                  <>
                    <HeartIcon size={40} className="text-white mb-1 [&_svg]:fill-current" />
                    <span className="text-white text-xl font-bold">I&apos;m OK</span>
                  </>
                )}
              </div>
            </button>

            {/* Biometric Option */}
            {hasPasskeys && !showSuccess && (
              <button
                onClick={handleBiometricCheckIn}
                disabled={isPending}
                className={cn(
                  "mt-6 flex items-center gap-3 px-6 py-3",
                  "rounded-full bg-white/5 border border-white/10",
                  "text-white/70 hover:text-white hover:bg-white/10",
                  "transition-all duration-300",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <FingerprintIcon size={20} className="text-violet-400" />
                <span className="text-sm font-medium">Use Biometric</span>
              </button>
            )}

            {/* Set up biometric link */}
            {hasPasskeys === false && !showSuccess && (
              <Link
                href="/profile/passkeys"
                className={cn(
                  "mt-6 flex items-center gap-2 px-4 py-2",
                  "text-white/50 hover:text-white/80",
                  "transition-colors duration-300"
                )}
              >
                <Shield className="w-4 h-4" />
                <span className="text-sm">Set up biometric check-in</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}

            {/* Error Message */}
            {(recordCheckIn.isError || biometricError) && (
              <div className="mt-4 px-4 py-2 rounded-lg bg-rose-500/20 text-rose-300 text-sm">
                {recordCheckIn.error?.message ?? biometricError}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div
            className={cn(
              "grid grid-cols-3 gap-3 mb-8 transition-all duration-700 delay-200",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <GlassCard className="p-4 text-center" glow="emerald">
              <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-lg bg-emerald-500/20">
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-emerald-400">{todayCheckIns}</p>
              <p className="text-xs text-white/50">Today</p>
            </GlassCard>

            <GlassCard className="p-4 text-center" glow="violet">
              <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-lg bg-violet-500/20">
                <Clock className="w-4 h-4 text-violet-400" />
              </div>
              <p className="text-2xl font-bold text-violet-400">
                {timeSinceLastCheckIn.replace(" ago", "")}
              </p>
              <p className="text-xs text-white/50">Since Last</p>
            </GlassCard>

            <GlassCard className="p-4 text-center" glow="amber">
              <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-lg bg-amber-500/20">
                <Calendar className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-amber-400">{streak}</p>
              <p className="text-xs text-white/50">Day Streak</p>
            </GlassCard>
          </div>

          {/* Notification Status */}
          {notificationPermission !== "unsupported" && (
            <div
              className={cn(
                "mb-8 transition-all duration-700 delay-250",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              <GlassCard
                className="p-4"
                glow={notificationPermission === "granted" ? "emerald" : undefined}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        notificationPermission === "granted"
                          ? "bg-emerald-500/20"
                          : "bg-white/5"
                      )}
                    >
                      {notificationPermission === "granted" ? (
                        <BellRing className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Bell className="w-5 h-5 text-white/40" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {notificationPermission === "granted"
                          ? "Notifications Enabled"
                          : "Enable Notifications"}
                      </p>
                      <p className="text-xs text-white/50">
                        {notificationPermission === "granted"
                          ? "You'll be notified when it's time to check in"
                          : "Get reminders to check in with loved ones"}
                      </p>
                    </div>
                  </div>
                  {notificationPermission === "granted" ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-medium text-emerald-400">Active</span>
                    </div>
                  ) : notificationPermission === "denied" ? (
                    <div className="px-3 py-1.5 rounded-full bg-rose-500/20">
                      <span className="text-xs font-medium text-rose-400">Blocked</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleEnableNotifications}
                      disabled={isEnablingNotifications}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-semibold text-white",
                        "bg-violet-500 hover:bg-violet-600",
                        "transition-colors duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {isEnablingNotifications ? "Enabling..." : "Enable"}
                    </button>
                  )}
                </div>
              </GlassCard>
            </div>
          )}

          {/* Recent Check-ins */}
          <div
            className={cn(
              "transition-all duration-700 delay-300",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-white/60" />
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            </div>

            {historyLoading ? (
              <GlassCard className="p-8">
                <div className="flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
                </div>
              </GlassCard>
            ) : !checkIns || checkIns.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-white/60 mb-1">No check-ins yet</p>
                <p className="text-sm text-white/40">
                  Tap the button above to record your first check-in
                </p>
              </GlassCard>
            ) : (
              <GlassCard className="divide-y divide-white/5">
                {checkIns.slice(0, 8).map((checkIn, index) => {
                  const performedAt = new Date(checkIn.performedAt)
                  const Icon = getMethodIcon(checkIn.method)
                  const colorClass = getMethodColor(checkIn.method)

                  return (
                    <div
                      key={checkIn.id}
                      className={cn(
                        "flex items-center justify-between p-4",
                        "transition-all duration-300",
                        "hover:bg-white/[0.02]"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            "bg-white/5"
                          )}
                        >
                          <Icon className={cn("w-5 h-5", colorClass)} />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {checkIn.method === "MANUAL"
                              ? "Manual Check-in"
                              : checkIn.method === "BIOMETRIC"
                              ? "Biometric Check-in"
                              : "Chat Check-in"}
                          </p>
                          <p className="text-xs text-white/40">
                            {performedAt.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-white/50">
                        {formatRelativeTime(performedAt)}
                      </span>
                    </div>
                  )
                })}
              </GlassCard>
            )}
          </div>

          {/* Info Card */}
          <div
            className={cn(
              "mt-8 transition-all duration-700 delay-400",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <GlassCard className="p-5" glow="blue">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Regular check-ins matter</p>
                  <p className="text-sm text-white/60">
                    Consistent check-ins help your loved ones know you&apos;re okay and build healthy
                    habits. Your streak shows your commitment to staying connected.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}
