"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";

const LEVEL_STYLES: Record<string, { bg: string; text: string }> = {
  LEVEL_1: { bg: "bg-yellow-500/30 text-yellow-700 dark:text-yellow-300", text: "Level 1" },
  LEVEL_2: { bg: "bg-orange-500/30 text-orange-700 dark:text-orange-300", text: "Level 2" },
  LEVEL_3: { bg: "bg-red-500/30 text-red-700 dark:text-red-300", text: "Level 3" },
  LEVEL_4: { bg: "bg-red-800/30 text-red-800 dark:text-red-200", text: "Level 4" },
  CANCELLED: { bg: "bg-muted text-muted-foreground", text: "Cancelled" },
  RESOLVED: { bg: "bg-green-500/30 text-green-700 dark:text-green-300", text: "Resolved" },
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
        <span className="text-yellow-600 dark:text-yellow-400">Active: {data.activeCount}</span>
        <span className="text-green-600 dark:text-green-400">Resolved: {data.resolvedCount}</span>
        <span className="text-muted-foreground">Cancelled: {data.cancelledCount}</span>
      </div>

      {/* Empty State */}
      {data.alerts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No alerts yet. Alerts are created when you miss a check-in.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Alert List */}
      {data.alerts.length > 0 && (
        <div className="flex flex-col gap-4">
          {data.alerts.map((alert) => {
            const style = LEVEL_STYLES[alert.level] ?? {
              bg: "bg-muted",
              text: alert.level,
            };
            const isActive = isActiveLevel(alert.level);

            return (
              <Card key={alert.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Badge className={style.bg}>
                          {style.text}
                        </Badge>
                        {isActive && (
                          <Badge variant="destructive" className="animate-pulse">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Triggered: {formatDate(alert.triggeredAt)}
                      </p>
                      {alert.resolvedAt && (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Resolved: {formatDate(alert.resolvedAt)}
                        </p>
                      )}
                      {alert.cancelledAt && (
                        <p className="text-sm text-muted-foreground">
                          Cancelled: {formatDate(alert.cancelledAt)}
                          {alert.cancelReason && ` - ${alert.cancelReason}`}
                        </p>
                      )}
                      {alert.lastEscalatedAt && (
                        <p className="text-sm text-muted-foreground/70">
                          Last escalated: {formatDate(alert.lastEscalatedAt)}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    {isActive && (
                      <div className="ml-4">
                        {cancelConfirmId === alert.id ? (
                          <div className="flex flex-col gap-2">
                            <Input
                              type="text"
                              placeholder="Reason (optional)"
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              className="h-8 text-sm"
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleCancel(alert.id)}
                                disabled={cancelAlert.isPending}
                                variant="destructive"
                                size="sm"
                              >
                                {cancelAlert.isPending ? "..." : "Confirm"}
                              </Button>
                              <Button
                                onClick={() => {
                                  setCancelConfirmId(null);
                                  setCancelReason("");
                                }}
                                variant="outline"
                                size="sm"
                              >
                                Back
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setCancelConfirmId(alert.id)}
                            variant="secondary"
                            size="sm"
                          >
                            Cancel Alert
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
