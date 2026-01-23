"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney",
] as const;

export function ProfileForm() {
  const [profile] = api.profile.get.useSuspenseQuery();
  const utils = api.useUtils();

  const [checkInFrequencyHours, setCheckInFrequencyHours] = useState(
    profile.checkInFrequencyHours,
  );
  const [preferredCheckInTime, setPreferredCheckInTime] = useState(
    profile.preferredCheckInTime ?? "",
  );
  const [timezone, setTimezone] = useState(profile.timezone);
  const [isActive, setIsActive] = useState(profile.isActive);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateProfile = api.profile.update.useMutation({
    onSuccess: async () => {
      await utils.profile.invalidate();
      setSuccessMessage("Profile updated successfully!");
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (err) => {
      setErrorMessage(err.message || "Failed to update profile");
      setSuccessMessage(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    updateProfile.mutate({
      checkInFrequencyHours,
      preferredCheckInTime: preferredCheckInTime || null,
      timezone,
      isActive,
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Check-in Frequency */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="frequency">Check-in Frequency (hours)</Label>
            <Input
              id="frequency"
              type="number"
              min={1}
              max={168}
              value={checkInFrequencyHours}
              onChange={(e) => setCheckInFrequencyHours(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              How often ALVIN should expect a check-in (1-168 hours)
            </p>
          </div>

          {/* Preferred Check-in Time */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="time">Preferred Check-in Time (optional)</Label>
            <Input
              id="time"
              type="time"
              value={preferredCheckInTime}
              onChange={(e) => setPreferredCheckInTime(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              What time of day you prefer to check in
            </p>
          </div>

          {/* Timezone */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </Select>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="active"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked === true)}
            />
            <Label htmlFor="active" className="font-normal">
              Active (ALVIN monitors check-ins)
            </Label>
          </div>

          {/* Feedback Messages */}
          {successMessage && (
            <p className="rounded-lg bg-green-500/20 px-4 py-2 text-sm text-green-600 dark:text-green-400">
              {successMessage}
            </p>
          )}
          {errorMessage && (
            <p className="rounded-lg bg-destructive/20 px-4 py-2 text-sm text-destructive">
              {errorMessage}
            </p>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
