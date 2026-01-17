"use client";

import { api } from "~/trpc/react";

interface CheckInBannerProps {
  conversationId: string;
}

export function CheckInBanner({ conversationId }: CheckInBannerProps) {
  const { data } = api.conversation.getCheckInStatus.useQuery(
    { conversationId },
    { refetchInterval: 5000 }, // Poll for updates
  );

  if (!data?.hasCheckIn) return null;

  return (
    <div className="border-b border-green-200 bg-green-50 p-3 text-center">
      <span className="text-sm text-green-700">
        Check-in recorded
        {data.checkInAt && (
          <span className="ml-2 text-green-600">
            ({new Date(data.checkInAt).toLocaleString()})
          </span>
        )}
      </span>
    </div>
  );
}
