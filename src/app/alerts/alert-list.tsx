"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

const LEVEL_STYLES: Record<string, { bg: string; text: string }> = {
  LEVEL_1: { bg: "bg-yellow-500/30", text: "Level 1" },
  LEVEL_2: { bg: "bg-orange-500/30", text: "Level 2" },
  LEVEL_3: { bg: "bg-red-500/30", text: "Level 3" },
  LEVEL_4: { bg: "bg-red-800/30", text: "Level 4" },
  CANCELLED: { bg: "bg-gray-500/30", text: "Cancelled" },
  RESOLVED: { bg: "bg-green-500/30", text: "Resolved" },
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleString();
}

function isActiveLevel(level: string): boolean {
  return ["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4"].includes(level);
}

export function AlertList() {
  const [data] = api.alert.list.useSuspenseQuery();
  const utils = api.useUtils();

  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const cancelAlert = api.alert.cancel.useMutation({
    onSuccess: async () => {
      await utils.alert.invalidate();
      setCancelConfirmId(null);
      setCancelReason("");
    },
  });

  const handleCancel = (id: string) => {
    cancelAlert.mutate({
      alertId: id,
      reason: cancelReason || undefined,
    });
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Summary Stats */}
      <div className="mb-6 flex justify-center gap-6 text-sm">
        <span className="text-yellow-400">Active: {data.activeCount}</span>
        <span className="text-green-400">Resolved: {data.resolvedCount}</span>
        <span className="text-gray-400">Cancelled: {data.cancelledCount}</span>
      </div>

      {/* Empty State */}
      {data.alerts.length === 0 && (
        <div className="rounded-xl bg-white/10 p-8 text-center">
          <p className="text-white/70">
            No alerts yet. Alerts are created when you miss a check-in.
          </p>
        </div>
      )}

      {/* Alert List */}
      {data.alerts.length > 0 && (
        <div className="flex flex-col gap-4">
          {data.alerts.map((alert) => {
            const style = LEVEL_STYLES[alert.level] ?? {
              bg: "bg-white/10",
              text: alert.level,
            };
            const isActive = isActiveLevel(alert.level);

            return (
              <div key={alert.id} className="rounded-xl bg-white/10 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${style.bg}`}
                      >
                        {style.text}
                      </span>
                      {isActive && (
                        <span className="animate-pulse rounded-full bg-red-500/50 px-2 py-0.5 text-xs">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-white/70">
                      Triggered: {formatDate(alert.triggeredAt)}
                    </p>
                    {alert.resolvedAt && (
                      <p className="text-sm text-green-400/70">
                        Resolved: {formatDate(alert.resolvedAt)}
                      </p>
                    )}
                    {alert.cancelledAt && (
                      <p className="text-sm text-gray-400/70">
                        Cancelled: {formatDate(alert.cancelledAt)}
                        {alert.cancelReason && ` - ${alert.cancelReason}`}
                      </p>
                    )}
                    {alert.lastEscalatedAt && (
                      <p className="text-sm text-white/50">
                        Last escalated: {formatDate(alert.lastEscalatedAt)}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {isActive && (
                    <div className="ml-4">
                      {cancelConfirmId === alert.id ? (
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            placeholder="Reason (optional)"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="rounded-lg bg-white/10 px-3 py-1 text-sm placeholder:text-white/50"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCancel(alert.id)}
                              disabled={cancelAlert.isPending}
                              className="rounded-lg bg-red-500/30 px-3 py-1 text-sm transition hover:bg-red-500/50 disabled:opacity-50"
                            >
                              {cancelAlert.isPending ? "..." : "Confirm"}
                            </button>
                            <button
                              onClick={() => {
                                setCancelConfirmId(null);
                                setCancelReason("");
                              }}
                              className="rounded-lg bg-white/10 px-3 py-1 text-sm transition hover:bg-white/20"
                            >
                              Back
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setCancelConfirmId(alert.id)}
                          className="rounded-lg bg-gray-500/30 px-4 py-2 text-sm transition hover:bg-gray-500/50"
                        >
                          Cancel Alert
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
