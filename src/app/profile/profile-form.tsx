"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

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
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-6 rounded-xl bg-white/10 p-8"
    >
      {/* Check-in Frequency */}
      <div className="flex flex-col gap-2">
        <label htmlFor="frequency" className="text-sm font-medium">
          Check-in Frequency (hours)
        </label>
        <input
          id="frequency"
          type="number"
          min={1}
          max={168}
          value={checkInFrequencyHours}
          onChange={(e) => setCheckInFrequencyHours(Number(e.target.value))}
          className="rounded-lg bg-white/10 px-4 py-2 text-white placeholder:text-white/50"
        />
        <p className="text-xs text-white/50">
          How often ALVIN should expect a check-in (1-168 hours)
        </p>
      </div>

      {/* Preferred Check-in Time */}
      <div className="flex flex-col gap-2">
        <label htmlFor="time" className="text-sm font-medium">
          Preferred Check-in Time (optional)
        </label>
        <input
          id="time"
          type="time"
          value={preferredCheckInTime}
          onChange={(e) => setPreferredCheckInTime(e.target.value)}
          className="rounded-lg bg-white/10 px-4 py-2 text-white"
        />
        <p className="text-xs text-white/50">
          What time of day you prefer to check in
        </p>
      </div>

      {/* Timezone */}
      <div className="flex flex-col gap-2">
        <label htmlFor="timezone" className="text-sm font-medium">
          Timezone
        </label>
        <select
          id="timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="rounded-lg bg-white/10 px-4 py-2 text-white"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz} className="bg-[#15162c]">
              {tz}
            </option>
          ))}
        </select>
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-3">
        <input
          id="active"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-5 w-5 rounded bg-white/10"
        />
        <label htmlFor="active" className="text-sm font-medium">
          Active (ALVIN monitors check-ins)
        </label>
      </div>

      {/* Feedback Messages */}
      {successMessage && (
        <p className="rounded-lg bg-green-500/20 px-4 py-2 text-sm text-green-300">
          {successMessage}
        </p>
      )}
      {errorMessage && (
        <p className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-300">
          {errorMessage}
        </p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={updateProfile.isPending}
        className="rounded-full bg-white/20 px-6 py-3 font-semibold transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {updateProfile.isPending ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
