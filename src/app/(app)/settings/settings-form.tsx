"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { cn } from "~/lib/utils";

const FREQUENCY_OPTIONS = [
  { value: 12, label: "12h" },
  { value: 24, label: "24h" },
  { value: 48, label: "48h" },
] as const;

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

export function SettingsForm() {
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
      setSuccessMessage("Settings saved!");
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (err) => {
      setErrorMessage(err.message || "Failed to save settings");
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Wellness Monitoring Toggle */}
      <div className="flex items-center justify-between rounded-xl bg-white/10 p-4">
        <div>
          <Label className="text-base font-medium text-white">
            Wellness Monitoring
          </Label>
          <p className="text-sm text-white/50">
            ALVIN will track your check-ins
          </p>
        </div>
        <Switch
          checked={isActive}
          onCheckedChange={setIsActive}
          className="data-[state=checked]:bg-green-500"
        />
      </div>

      {/* Check-in Frequency */}
      <div className="flex flex-col gap-3">
        <Label className="text-white/80">Check-in Frequency</Label>
        <div className="flex gap-2">
          {FREQUENCY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setCheckInFrequencyHours(option.value)}
              className={cn(
                "flex-1 rounded-lg py-3 text-sm font-medium transition-colors",
                checkInFrequencyHours === option.value
                  ? "bg-violet-600 text-white"
                  : "bg-white/10 text-white/60 hover:bg-white/20",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-white/50">
          How often ALVIN expects a check-in
        </p>
      </div>

      {/* Preferred Check-in Time */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="time" className="text-white/80">
          Preferred Time (optional)
        </Label>
        <Input
          id="time"
          type="time"
          value={preferredCheckInTime}
          onChange={(e) => setPreferredCheckInTime(e.target.value)}
          className="border-white/10 bg-white/5 text-white [color-scheme:dark]"
        />
        <p className="text-xs text-white/50">
          What time of day you prefer to check in
        </p>
      </div>

      {/* Timezone */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="timezone" className="text-white/80">
          Timezone
        </Label>
        <select
          id="timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-violet-500 focus:outline-none"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz} className="bg-[#1a1a2e]">
              {tz.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Feedback Messages */}
      {successMessage && (
        <p className="rounded-lg bg-green-500/20 px-4 py-2 text-sm text-green-400">
          {successMessage}
        </p>
      )}
      {errorMessage && (
        <p className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-400">
          {errorMessage}
        </p>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={updateProfile.isPending}
        className="bg-violet-600 hover:bg-violet-500"
      >
        {updateProfile.isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
