"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types & Constants
// ─────────────────────────────────────────────────────────────────────────────

const LEVEL_CONFIG: Record<
  string,
  {
    color: string;
    bgColor: string;
    borderColor: string;
    glowColor: string;
    label: string;
    description: string;
    icon: typeof AlertTriangle;
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
};

// ─────────────────────────────────────────────────────────────────────────────
// GlassCard Component
// ─────────────────────────────────────────────────────────────────────────────

function GlassCard({
  children,
  className,
  glow,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: "emerald" | "violet" | "amber" | "rose" | "blue" | "red";
}) {
  const glowColors = {
    emerald: "shadow-emerald-500/20",
    violet: "shadow-violet-500/20",
    amber: "shadow-amber-500/20",
    rose: "shadow-rose-500/20",
    blue: "shadow-blue-500/20",
    red: "shadow-red-500/30",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-white/[0.03] backdrop-blur-xl",
        "border border-white/[0.05]",
        glow && `shadow-2xl ${glowColors[glow]}`,
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
      <div className="relative">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function isActiveLevel(level: string): boolean {
  return ["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4"].includes(level);
}

function getElapsedTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cancel Alert Modal
// ─────────────────────────────────────────────────────────────────────────────

function CancelAlertModal({
  onClose,
  onConfirm,
  isPending,
}: {
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="animate-reveal relative w-full max-w-sm">
        <GlassCard className="p-6" glow="amber">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
            <BellOff className="h-6 w-6 text-amber-400" />
          </div>
          <h3 className="mb-2 text-center text-lg font-semibold text-white">
            Cancel Alert
          </h3>
          <p className="mb-4 text-center text-sm text-white/60">
            Your contacts will stop receiving notifications about this alert.
          </p>

          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional)"
            className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors placeholder:text-white/30 focus:border-amber-500/50 focus:outline-none"
          />

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl bg-white/5 py-3 font-medium text-white/70 transition-colors hover:bg-white/10"
            >
              Keep Alert
            </button>
            <button
              onClick={() => onConfirm(reason)}
              disabled={isPending}
              className="flex-1 rounded-xl bg-amber-500 py-3 font-medium text-white transition-colors hover:bg-amber-400 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              ) : (
                "Cancel Alert"
              )}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
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
    id: string;
    level: string;
    triggeredAt: Date;
  };
  onCancel: () => void;
  onCheckIn: () => void;
  checkInPending: boolean;
}) {
  const config = LEVEL_CONFIG[alert.level] ?? LEVEL_CONFIG.LEVEL_1!;
  const Icon = config.icon;
  const [elapsed, setElapsed] = useState(
    getElapsedTime(new Date(alert.triggeredAt)),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(getElapsedTime(new Date(alert.triggeredAt)));
    }, 60000);
    return () => clearInterval(interval);
  }, [alert.triggeredAt]);

  return (
    <div className="animate-reveal mb-8">
      <GlassCard
        className={cn("border p-5", config.borderColor)}
        glow={alert.level === "LEVEL_4" ? "red" : "amber"}
      >
        {/* Pulsing Background */}
        <div
          className={cn(
            "absolute inset-0 animate-pulse rounded-2xl opacity-20",
            config.bgColor,
          )}
        />

        <div className="relative">
          {/* Status Row */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  config.bgColor,
                )}
              >
                <Icon className={cn("h-5 w-5", config.color)} />
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
                        config.bgColor.replace("/20", "/50"),
                      )}
                    />
                    <span
                      className={cn(
                        "relative inline-flex h-2 w-2 rounded-full",
                        config.bgColor.replace("/20", ""),
                      )}
                    />
                  </span>
                </div>
                <p className="text-xs text-white/50">{config.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={cn("text-2xl font-bold", config.color)}>
                {elapsed}
              </p>
              <p className="text-xs text-white/40">elapsed</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCheckIn}
              disabled={checkInPending}
              className={cn(
                "flex-1 rounded-xl py-3 font-medium transition-all",
                "bg-gradient-to-r from-emerald-500 to-emerald-600",
                "text-white shadow-lg shadow-emerald-500/30",
                "hover:shadow-emerald-500/50",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "flex items-center justify-center gap-2",
              )}
            >
              {checkInPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Heart className="h-5 w-5" fill="currentColor" />
                  I&apos;m OK
                </>
              )}
            </button>
            <button
              onClick={onCancel}
              className="rounded-xl bg-white/5 px-6 py-3 font-medium text-white/70 transition-colors hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Alert History Card
// ─────────────────────────────────────────────────────────────────────────────

function AlertHistoryCard({
  alert,
  index,
}: {
  alert: {
    id: string;
    level: string;
    triggeredAt: Date;
    resolvedAt: Date | null;
    cancelledAt: Date | null;
    cancelReason: string | null;
    lastEscalatedAt: Date | null;
  };
  index: number;
}) {
  const config = LEVEL_CONFIG[alert.level] ?? LEVEL_CONFIG.LEVEL_1!;
  const Icon = config.icon;

  return (
    <div
      className="animate-reveal"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <GlassCard className="p-4 transition-colors hover:border-white/10">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div
            className={cn(
              "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl",
              config.bgColor,
            )}
          >
            <Icon className={cn("h-6 w-6", config.color)} />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className={cn("text-sm font-semibold", config.color)}>
                {config.label}
              </span>
              {!isActiveLevel(alert.level) && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs",
                    alert.level === "RESOLVED"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-slate-500/20 text-slate-300",
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
              <p className="mt-1 text-xs text-emerald-400/80">
                Resolved {formatRelativeTime(new Date(alert.resolvedAt))}
              </p>
            )}

            {alert.cancelledAt && (
              <p className="mt-1 text-xs text-white/40">
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
  );
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
  ];

  return (
    <GlassCard className="p-5" glow="violet">
      <div className="mb-4 flex items-center gap-2">
        <Shield className="h-5 w-5 text-violet-400" />
        <h3 className="font-semibold text-white">Escalation Timeline</h3>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute top-2 bottom-2 left-4 w-0.5 bg-gradient-to-b from-amber-500 via-orange-500 to-red-500" />

        {/* Steps */}
        <div className="space-y-4">
          {levels.map((level, i) => (
            <div key={level.level} className="flex items-start gap-4 pl-1">
              <div
                className={cn(
                  "z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                  i === 0 && "bg-amber-500 text-amber-950",
                  i === 1 && "bg-orange-500 text-orange-950",
                  i === 2 && "bg-rose-500 text-rose-950",
                  i === 3 && "bg-red-500 text-red-950",
                )}
              >
                {level.level}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{level.action}</p>
                <p className="text-xs text-white/40">After {level.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Alerts Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AlertsPage() {
  const [mounted, setMounted] = useState(false);
  const [cancelAlertId, setCancelAlertId] = useState<string | null>(null);

  const utils = api.useUtils();
  const { data, isLoading } = api.alert.list.useQuery();

  const cancelAlert = api.alert.cancel.useMutation({
    onSuccess: async () => {
      await utils.alert.invalidate();
      setCancelAlertId(null);
    },
  });

  const recordCheckIn = api.checkIn.record.useMutation({
    onSuccess: async () => {
      await utils.alert.invalidate();
      await utils.checkIn.invalidate();
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeAlert = data?.alerts.find((a) => isActiveLevel(a.level));
  const historyAlerts =
    data?.alerts.filter((a) => !isActiveLevel(a.level)) ?? [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#1a0533] via-[#2e026d] to-[#15162c]">
      {/* Animated Background Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="animate-blob animation-delay-2000 absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="animate-blob animation-delay-4000 absolute right-1/4 bottom-20 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 px-4 pt-8 pb-32">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div
            className={cn(
              "mb-8 transition-all duration-700",
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
          >
            <p className="mb-2 text-xs font-medium tracking-[0.2em] text-amber-400/80 uppercase">
              Safety System
            </p>
            <h1 className="text-3xl font-bold text-white">Alert Center</h1>
            <p className="mt-2 text-sm text-white/50">
              Monitor and manage your check-in alerts
            </p>
          </div>

          {/* Stats */}
          {!isLoading && data && (
            <div
              className={cn(
                "mb-8 grid grid-cols-3 gap-3 transition-all delay-100 duration-700",
                mounted
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0",
              )}
            >
              <GlassCard
                className="p-4 text-center"
                glow={data.activeCount > 0 ? "amber" : undefined}
              >
                <p
                  className={cn(
                    "text-3xl font-bold",
                    data.activeCount > 0 ? "text-amber-400" : "text-white/40",
                  )}
                >
                  {data.activeCount}
                </p>
                <p className="text-xs text-white/50">Active</p>
              </GlassCard>
              <GlassCard className="p-4 text-center" glow="emerald">
                <p className="text-3xl font-bold text-emerald-400">
                  {data.resolvedCount}
                </p>
                <p className="text-xs text-white/50">Resolved</p>
              </GlassCard>
              <GlassCard className="p-4 text-center">
                <p className="text-3xl font-bold text-white/40">
                  {data.cancelledCount}
                </p>
                <p className="text-xs text-white/50">Cancelled</p>
              </GlassCard>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <GlassCard className="p-12">
              <div className="flex flex-col items-center">
                <Loader2 className="mb-4 h-8 w-8 animate-spin text-amber-400" />
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
                "transition-all delay-100 duration-700",
                mounted
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0",
              )}
            >
              <GlassCard className="p-10 text-center" glow="emerald">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  All Clear
                </h3>
                <p className="mx-auto max-w-sm text-white/60">
                  No active or past alerts. Keep checking in regularly to
                  maintain your streak!
                </p>
              </GlassCard>
            </div>
          )}

          {/* Alert History */}
          {!isLoading && historyAlerts.length > 0 && (
            <div
              className={cn(
                "transition-all delay-200 duration-700",
                mounted
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0",
              )}
            >
              <div className="mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-white/60" />
                <h2 className="text-lg font-semibold text-white">History</h2>
              </div>
              <div className="space-y-3">
                {historyAlerts.map((alert, index) => (
                  <AlertHistoryCard
                    key={alert.id}
                    alert={alert}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Escalation Info */}
          <div
            className={cn(
              "mt-8 transition-all delay-300 duration-700",
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
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
            cancelAlert.mutate({
              alertId: cancelAlertId,
              reason: reason || undefined,
            })
          }
          isPending={cancelAlert.isPending}
        />
      )}
    </div>
  );
}
