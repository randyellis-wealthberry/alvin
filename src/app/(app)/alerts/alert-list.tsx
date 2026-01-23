"use client"

import { useState } from "react"
import { Bell, X } from "lucide-react"
import { api } from "~/trpc/react"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Input } from "~/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog"
import { cn } from "~/lib/utils"

const LEVEL_STYLES: Record<
  string,
  { bg: string; label: string; description: string }
> = {
  LEVEL_1: {
    bg: "bg-yellow-500/30 text-yellow-200",
    label: "Level 1",
    description: "24 hours since last check-in",
  },
  LEVEL_2: {
    bg: "bg-orange-500/30 text-orange-200",
    label: "Level 2",
    description: "48 hours since last check-in",
  },
  LEVEL_3: {
    bg: "bg-red-500/30 text-red-200",
    label: "Level 3",
    description: "72 hours since last check-in",
  },
  LEVEL_4: {
    bg: "bg-red-800/30 text-red-200",
    label: "Level 4",
    description: "96 hours since last check-in",
  },
  CANCELLED: {
    bg: "bg-gray-500/30 text-gray-300",
    label: "Cancelled",
    description: "Alert was manually cancelled",
  },
  RESOLVED: {
    bg: "bg-green-500/30 text-green-200",
    label: "Resolved",
    description: "User checked in",
  },
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) {
    return "just now"
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`
  } else {
    return date.toLocaleDateString()
  }
}

function isActiveLevel(level: string): boolean {
  return ["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4"].includes(level)
}

export function AlertList() {
  const [data] = api.alert.list.useSuspenseQuery()
  const utils = api.useUtils()

  const [cancelAlertId, setCancelAlertId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState("")

  const cancelAlertMutation = api.alert.cancel.useMutation({
    onSuccess: async () => {
      await utils.alert.invalidate()
      setCancelAlertId(null)
      setCancelReason("")
    },
  })

  const handleCancel = () => {
    if (cancelAlertId) {
      cancelAlertMutation.mutate({
        alertId: cancelAlertId,
        reason: cancelReason || undefined,
      })
    }
  }

  return (
    <div className="w-full">
      {/* Summary Stats */}
      <div className="mb-8 flex justify-center gap-6">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-yellow-400">
            {data.activeCount}
          </span>
          <span className="text-xs text-white/50">Active</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-green-400">
            {data.resolvedCount}
          </span>
          <span className="text-xs text-white/50">Resolved</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-white/40">
            {data.cancelledCount}
          </span>
          <span className="text-xs text-white/50">Cancelled</span>
        </div>
      </div>

      {/* Empty State */}
      {data.alerts.length === 0 && (
        <div className="rounded-xl bg-white/5 px-6 py-10 text-center">
          <Bell className="mx-auto mb-3 h-10 w-10 text-white/30" />
          <p className="text-white/70">No alerts yet</p>
          <p className="mt-1 text-sm text-white/50">
            Alerts are created when you miss a check-in
          </p>
        </div>
      )}

      {/* Alert List */}
      {data.alerts.length > 0 && (
        <div className="flex flex-col gap-4">
          {data.alerts.map((alert) => {
            const style = LEVEL_STYLES[alert.level] ?? {
              bg: "bg-gray-500/30 text-gray-300",
              label: alert.level,
              description: "",
            }
            const isActive = isActiveLevel(alert.level)

            return (
              <div
                key={alert.id}
                className={cn(
                  "rounded-xl p-5",
                  "bg-white/10 transition-colors hover:bg-white/[0.12]"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={style.bg}>{style.label}</Badge>
                      {isActive && (
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-white/60">
                      Triggered {formatRelativeTime(new Date(alert.triggeredAt))}
                    </p>

                    {alert.resolvedAt && (
                      <p className="text-sm text-green-400">
                        Resolved {formatRelativeTime(new Date(alert.resolvedAt))}
                      </p>
                    )}

                    {alert.cancelledAt && (
                      <p className="text-sm text-white/50">
                        Cancelled {formatRelativeTime(new Date(alert.cancelledAt))}
                        {alert.cancelReason && (
                          <span className="ml-1">- {alert.cancelReason}</span>
                        )}
                      </p>
                    )}

                    {alert.lastEscalatedAt && isActive && (
                      <p className="mt-1 text-xs text-white/40">
                        Last escalated{" "}
                        {formatRelativeTime(new Date(alert.lastEscalatedAt))}
                      </p>
                    )}
                  </div>

                  {/* Cancel Button */}
                  {isActive && (
                    <Button
                      onClick={() => setCancelAlertId(alert.id)}
                      variant="ghost"
                      size="sm"
                      className="text-white/60 hover:bg-red-500/20 hover:text-red-400"
                    >
                      <X className="mr-1 h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Cancel Dialog */}
      <Dialog
        open={!!cancelAlertId}
        onOpenChange={(open) => {
          if (!open) {
            setCancelAlertId(null)
            setCancelReason("")
          }
        }}
      >
        <DialogContent className="border-white/10 bg-[#1a1a2e] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Alert</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4 text-sm text-white/60">
              Are you sure you want to cancel this alert? Your contacts will not
              be notified further.
            </p>
            <Input
              type="text"
              placeholder="Reason (optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setCancelAlertId(null)
                setCancelReason("")
              }}
              variant="ghost"
              className="text-white/70 hover:bg-white/10 hover:text-white"
            >
              Keep Alert
            </Button>
            <Button
              onClick={handleCancel}
              disabled={cancelAlertMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-500"
            >
              {cancelAlertMutation.isPending ? "Cancelling..." : "Cancel Alert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
