"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Bell,
  Mail,
  MessageSquare,
  Sun,
  Sunset,
  Moon,
  Globe,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";

const frequencies = [
  { hours: 12, label: "Twice daily" },
  { hours: 24, label: "Once daily" },
  { hours: 48, label: "Every other day" },
  { hours: 72, label: "Every 3 days" },
] as const;

const reminderTimes = [
  { key: "morning", label: "Morning", time: "09:00", icon: Sun },
  { key: "afternoon", label: "Afternoon", time: "14:00", icon: Sunset },
  { key: "evening", label: "Evening", time: "20:00", icon: Moon },
] as const;

const notificationOptions = [
  { key: "push", label: "Push Notifications", icon: Bell, defaultOn: true },
  { key: "email", label: "Email Reminders", icon: Mail, defaultOn: true },
  { key: "sms", label: "SMS Alerts", icon: MessageSquare, defaultOn: false },
] as const;

export default function PreferencesPage() {
  const router = useRouter();

  const [frequency, setFrequency] = useState(24);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
  });
  const [timezone, setTimezone] = useState("");
  const [showTimezoneInput, setShowTimezoneInput] = useState(false);
  const [timezoneOverride, setTimezoneOverride] = useState("");

  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(detected);
    setTimezoneOverride(detected);
  }, []);

  const updateProfile = api.profile.update.useMutation({
    onSuccess: () => {
      router.push("/onboarding/contact");
    },
  });

  const handleContinue = () => {
    updateProfile.mutate({
      checkInFrequencyHours: frequency,
      preferredCheckInTime: reminderTime,
      timezone: showTimezoneInput ? timezoneOverride : timezone,
      isActive: true,
    });
  };

  return (
    <div className="animate-fade-in mx-auto w-full max-w-2xl">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Set Your Preferences
          </h1>
          <p className="mt-2 text-white/60">
            Customize how ALVIN checks in on you.
          </p>
        </div>

        {/* Check-in Frequency */}
        <div>
          <Label className="mb-3 flex items-center gap-2 text-sm font-medium text-white/80">
            <Clock className="h-4 w-4" />
            How often should we check in?
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {frequencies.map((f) => (
              <button
                key={f.hours}
                type="button"
                onClick={() => setFrequency(f.hours)}
                className={`cursor-pointer rounded-xl border p-4 text-left transition-all ${
                  frequency === f.hours
                    ? "border-cyan-400/50 bg-cyan-400/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock
                    className={`h-5 w-5 ${
                      frequency === f.hours ? "text-cyan-400" : "text-white/40"
                    }`}
                  />
                  <div>
                    <span
                      className={`text-2xl font-bold ${
                        frequency === f.hours ? "text-cyan-400" : "text-white"
                      }`}
                    >
                      {f.hours}h
                    </span>
                    <p className="text-sm text-white/50">{f.label}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Reminder Time */}
        <div className="mt-6 border-t border-white/10 pt-6">
          <Label className="mb-3 block text-sm font-medium text-white/80">
            When do you prefer to be reminded?
          </Label>
          <div className="grid grid-cols-3 gap-3">
            {reminderTimes.map((rt) => {
              const Icon = rt.icon;
              const selected = reminderTime === rt.time;
              return (
                <button
                  key={rt.key}
                  type="button"
                  onClick={() => setReminderTime(rt.time)}
                  className={`cursor-pointer rounded-xl border p-4 text-center transition-all ${
                    selected
                      ? "border-cyan-400/50 bg-cyan-400/10"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <Icon
                    className={`mx-auto mb-2 h-6 w-6 ${
                      selected ? "text-cyan-400" : "text-white/40"
                    }`}
                  />
                  <p
                    className={`text-sm font-medium ${
                      selected ? "text-cyan-400" : "text-white"
                    }`}
                  >
                    {rt.label}
                  </p>
                  <p className="mt-0.5 text-xs text-white/40">{rt.time}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="mt-6 border-t border-white/10 pt-6">
          <Label className="mb-4 block text-sm font-medium text-white/80">
            How should we reach you?
          </Label>
          <div className="space-y-3">
            {notificationOptions.map((opt) => {
              const Icon = opt.icon;
              const checked = notifications[opt.key];
              return (
                <div
                  key={opt.key}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-white/40" />
                    <span className="text-sm text-white">{opt.label}</span>
                  </div>
                  <Switch
                    checked={checked}
                    onCheckedChange={(value) =>
                      setNotifications((prev) => ({
                        ...prev,
                        [opt.key]: value,
                      }))
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Timezone */}
        <div className="mt-6 border-t border-white/10 pt-6">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-white/40" />
            <span className="text-sm text-white/60">
              Detected timezone:{" "}
              <span className="font-medium text-white">
                {showTimezoneInput ? timezoneOverride : timezone}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setShowTimezoneInput(!showTimezoneInput)}
              className="ml-2 cursor-pointer text-xs text-cyan-400 hover:text-cyan-300"
            >
              {showTimezoneInput ? "Cancel" : "Change"}
            </button>
          </div>
          {showTimezoneInput && (
            <input
              type="text"
              value={timezoneOverride}
              onChange={(e) => setTimezoneOverride(e.target.value)}
              placeholder="e.g. America/New_York"
              className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/50"
            />
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/onboarding/welcome")}
            className="text-white/60 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={updateProfile.isPending}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500"
          >
            {updateProfile.isPending ? (
              "Saving..."
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
