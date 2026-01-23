"use client"

import { useState, useEffect } from "react"
import {
  Bell,
  BellOff,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Heart,
  Loader2,
} from "lucide-react"
import { api } from "~/trpc/react"
import { cn } from "~/lib/utils"

// ─────────────────────────────────────────────────────────────────────────────
// Types & Constants
// ─────────────────────────────────────────────────────────────────────────────

const LEVEL_CONFIG: Record<
  string,
  {
    color: string
    bgColor: string
    borderColor: string
    glowColor: string
    label: string
    description: string
    icon: typeof AlertTriangle
  }
> = {
  LEVEL_1: {
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
    borderColor: "border-amber-500/30",
    glowColor: "shadow-amber-500/20",
    label: "Level 1",
    description: "Initial reminder sent",
    icon: Bell,
  },
  LEVEL_2: {
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500/30",
    glowColor: "shadow-orange-500/20",
    label: "Level 2",
    description: "Multiple reminders sent",
    icon: Bell,
  },
  LEVEL_3: {
    color: "text-rose-400",
    bgColor: "bg-rose-500/20",
    borderColor: "border-rose-500/30",
    glowColor: "shadow-rose-500/20",
    label: "Level 3",
    description: "Priority contacts notified",
    icon: AlertTriangle,
  },
  LEVEL_4: {
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/30",
    glowColor: "shadow-red-500/30",
    label: "Level 4",
    description: "All contacts notified",
    icon: AlertTriangle,
  },
  CANCELLED: {
    color: "text-slate-400",
    bgColor: "bg-slate-500/20",
    borderColor: "border-slate-500/30",
    glowColor: "shadow-slate-500/10",
    label: "Cancelled",
    description: "Manually cancelled",
    icon: XCircle,
  },
  RESOLVED: {
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    borderColor: "border-emerald-500/30",
    glowColor: "shadow-emerald-500/20",
    label: "Resolved",
    description: "Check-in completed",
    icon: CheckCircle2,
  },
}

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
  glow?: "emerald" | "violet" | "amber" | "rose" | "blue" | "red"
}) {
  const glowColors = {
    emerald: "shadow-emerald-500/20",
    violet: "shadow-violet-500/20",
    amber: "shadow-amber-500/20",
    rose: "shadow-rose-500/20",
    blue: "shadow-blue-500/20",
    red: "shadow-red-500/30",
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
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function isActiveLevel(level: string): boolean {
  return ["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4"].includes(level)
}

function getElapsedTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

// ─────────────────────────────────────────────────────────────────────────────
// Cancel Alert Modal
// ─────────────────────────────────────────────────────────────────────────────

function CancelAlertModal({
  onClose,
  onConfirm,
  isPending,
}: {
  onClose: () => void
  onConfirm: (reason: string) => void
  isPending: boolean
}) {
  const [reason, setReason] = useState("")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm animate-reveal">
        <GlassCard className="p-6" glow="amber">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <BellOff className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-white text-center mb-2">
            Cancel Alert
          </h3>
          <p className="text-white/60 text-center text-sm mb-4">
            Your contacts will stop receiving notifications about this alert.
          </p>

          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional)"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 transition-colors mb-4"
          />

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-white/5 text-white/70 font-medium hover:bg-white/10 transition-colors"
            >
              Keep Alert
            </button>
            <button
              onClick={() => onConfirm(reason)}
              disabled={isPending}
              className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-400 transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 mx-auto animate-spin" />
              ) : (
                "Cancel Alert"
              )}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Active Alert Banner
// ─────────────────────────────────────────────────────────────────────────────

function ActiveAlertBanner({
  alert,
  onCancel,
  onCheckIn,
  checkInPending,
}: {
  alert: {
    id: string
    level: string
    triggeredAt: Date
  }
  onCancel: () => void
  onCheckIn: () => void
  checkInPending: boolean
}) {
  const config = LEVEL_CONFIG[alert.level] ?? LEVEL_CONFIG.LEVEL_1!
  const Icon = config.icon
  const [elapsed, setElapsed] = useState(getElapsedTime(new Date(alert.triggeredAt)))

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(getElapsedTime(new Date(alert.triggeredAt)))
    }, 60000)
    return () => clearInterval(interval)
  }, [alert.triggeredAt])

  return (
    <div className="mb-8 animate-reveal">
      <GlassCard
        className={cn("p-5 border", config.borderColor)}
        glow={alert.level === "LEVEL_4" ? "red" : "amber"}
      >
        {/* Pulsing Background */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl animate-pulse opacity-20",
            config.bgColor
          )}
        />

        <div className="relative">
          {/* Status Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  config.bgColor
                )}
              >
                <Icon className={cn("w-5 h-5", config.color)} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={cn("font-semibold", config.color)}>
                    {config.label}
                  </span>
                  <span className="relative flex h-2 w-2">
                    <span
                      className={cn(
                        "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                        config.bgColor.replace("/20", "/50")
                      )}
                    />
                    <span
                      className={cn(
                        "relative inline-flex h-2 w-2 rounded-full",
                        config.bgColor.replace("/20", "")
                      )}
                    />
                  </span>
                </div>
                <p className="text-xs text-white/50">{config.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={cn("text-2xl font-bold", config.color)}>{elapsed}</p>
              <p className="text-xs text-white/40">elapsed</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCheckIn}
              disabled={checkInPending}
              className={cn(
                "flex-1 py-3 rounded-xl font-medium transition-all",
                "bg-gradient-to-r from-emerald-500 to-emerald-600",
                "text-white shadow-lg shadow-emerald-500/30",
                "hover:shadow-emerald-500/50",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2"
              )}
            >
              {checkInPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Heart className="w-5 h-5" fill="currentColor" />
                  I&apos;m OK
                </>
              )}
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-3 rounded-xl bg-white/5 text-white/70 font-medium hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Alert History Card
// ─────────────────────────────────────────────────────────────────────────────

function AlertHistoryCard({
  alert,
  index,
}: {
  alert: {
    id: string
    level: string
    triggeredAt: Date
    resolvedAt: Date | null
    cancelledAt: Date | null
    cancelReason: string | null
    lastEscalatedAt: Date | null
  }
  index: number
}) {
  const config = LEVEL_CONFIG[alert.level] ?? LEVEL_CONFIG.LEVEL_1!
  const Icon = config.icon

  return (
    <div
      className="animate-reveal"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <GlassCard className="p-4 hover:border-white/10 transition-colors">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
              config.bgColor
            )}
          >
            <Icon className={cn("w-6 h-6", config.color)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("font-semibold text-sm", config.color)}>
                {config.label}
              </span>
              {!isActiveLevel(alert.level) && (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs",
                    alert.level === "RESOLVED"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-slate-500/20 text-slate-300"
                  )}
                >
                  {alert.level === "RESOLVED" ? "Resolved" : "Cancelled"}
                </span>
              )}
            </div>

            <p className="text-xs text-white/50">
              Triggered {formatRelativeTime(new Date(alert.triggeredAt))}
            </p>

            {alert.resolvedAt && (
              <p className="text-xs text-emerald-400/80 mt-1">
                Resolved {formatRelativeTime(new Date(alert.resolvedAt))}
              </p>
            )}

            {alert.cancelledAt && (
              <p className="text-xs text-white/40 mt-1">
                Cancelled {formatRelativeTime(new Date(alert.cancelledAt))}
                {alert.cancelReason && ` - "${alert.cancelReason}"`}
              </p>
            )}
          </div>

          {/* Time */}
          <div className="text-right">
            <p className="text-sm text-white/40">
              {new Date(alert.triggeredAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Escalation Timeline
// ─────────────────────────────────────────────────────────────────────────────

function EscalationTimeline() {
  const levels = [
    { level: 1, time: "0h", action: "Reminder sent to you" },
    { level: 2, time: "1h", action: "Multiple reminders sent" },
    { level: 3, time: "2h", action: "Priority 1 contacts notified" },
    { level: 4, time: "4h", action: "All contacts notified" },
  ]

  return (
    <GlassCard className="p-5" glow="violet">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-violet-400" />
        <h3 className="font-semibold text-white">Escalation Timeline</h3>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-amber-500 via-orange-500 to-red-500" />

        {/* Steps */}
        <div className="space-y-4">
          {levels.map((level, i) => (
            <div key={level.level} className="flex items-start gap-4 pl-1">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-10",
                  i === 0 && "bg-amber-500 text-amber-950",
                  i === 1 && "bg-orange-500 text-orange-950",
                  i === 2 && "bg-rose-500 text-rose-950",
                  i === 3 && "bg-red-500 text-red-950"
                )}
              >
                {level.level}
              </div>
              <div>
                <p className="text-sm text-white font-medium">{level.action}</p>
                <p className="text-xs text-white/40">After {level.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Alerts Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AlertsPage() {
  const [mounted, setMounted] = useState(false)
  const [cancelAlertId, setCancelAlertId] = useState<string | null>(null)

  const utils = api.useUtils()
  const { data, isLoading } = api.alert.list.useQuery()

  const cancelAlert = api.alert.cancel.useMutation({
    onSuccess: async () => {
      await utils.alert.invalidate()
      setCancelAlertId(null)
    },
  })

  const recordCheckIn = api.checkIn.record.useMutation({
    onSuccess: async () => {
      await utils.alert.invalidate()
      await utils.checkIn.invalidate()
    },
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const activeAlert = data?.alerts.find((a) => isActiveLevel(a.level))
  const historyAlerts = data?.alerts.filter((a) => !isActiveLevel(a.level)) ?? []

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#1a0533] via-[#2e026d] to-[#15162c]">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 px-4 pt-8 pb-32">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div
            className={cn(
              "mb-8 transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <p className="text-xs font-medium tracking-[0.2em] text-amber-400/80 uppercase mb-2">
              Safety System
            </p>
            <h1 className="text-3xl font-bold text-white">Alert Center</h1>
            <p className="mt-2 text-white/50 text-sm">
              Monitor and manage your check-in alerts
            </p>
          </div>

          {/* Stats */}
          {!isLoading && data && (
            <div
              className={cn(
                "grid grid-cols-3 gap-3 mb-8 transition-all duration-700 delay-100",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              <GlassCard className="p-4 text-center" glow={data.activeCount > 0 ? "amber" : undefined}>
                <p className={cn("text-3xl font-bold", data.activeCount > 0 ? "text-amber-400" : "text-white/40")}>
                  {data.activeCount}
                </p>
                <p className="text-xs text-white/50">Active</p>
              </GlassCard>
              <GlassCard className="p-4 text-center" glow="emerald">
                <p className="text-3xl font-bold text-emerald-400">{data.resolvedCount}</p>
                <p className="text-xs text-white/50">Resolved</p>
              </GlassCard>
              <GlassCard className="p-4 text-center">
                <p className="text-3xl font-bold text-white/40">{data.cancelledCount}</p>
                <p className="text-xs text-white/50">Cancelled</p>
              </GlassCard>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <GlassCard className="p-12">
              <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-4" />
                <p className="text-white/60">Loading alerts...</p>
              </div>
            </GlassCard>
          )}

          {/* Active Alert */}
          {activeAlert && (
            <ActiveAlertBanner
              alert={activeAlert}
              onCancel={() => setCancelAlertId(activeAlert.id)}
              onCheckIn={() => recordCheckIn.mutate()}
              checkInPending={recordCheckIn.isPending}
            />
          )}

          {/* Empty State */}
          {!isLoading && (!data?.alerts || data.alerts.length === 0) && (
            <div
              className={cn(
                "transition-all duration-700 delay-100",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              <GlassCard className="p-10 text-center" glow="emerald">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">All Clear</h3>
                <p className="text-white/60 max-w-sm mx-auto">
                  No active or past alerts. Keep checking in regularly to maintain your streak!
                </p>
              </GlassCard>
            </div>
          )}

          {/* Alert History */}
          {!isLoading && historyAlerts.length > 0 && (
            <div
              className={cn(
                "transition-all duration-700 delay-200",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-white/60" />
                <h2 className="text-lg font-semibold text-white">History</h2>
              </div>
              <div className="space-y-3">
                {historyAlerts.map((alert, index) => (
                  <AlertHistoryCard key={alert.id} alert={alert} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Escalation Info */}
          <div
            className={cn(
              "mt-8 transition-all duration-700 delay-300",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <EscalationTimeline />
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelAlertId && (
        <CancelAlertModal
          onClose={() => setCancelAlertId(null)}
          onConfirm={(reason) =>
            cancelAlert.mutate({ alertId: cancelAlertId, reason: reason || undefined })
          }
          isPending={cancelAlert.isPending}
        />
      )}
    </div>
  )
}
