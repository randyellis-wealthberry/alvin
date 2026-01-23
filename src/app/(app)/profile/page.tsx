"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  Settings,
  Bell,
  Clock,
  Globe,
  ChevronRight,
  LogOut,
  Fingerprint,
  Heart,
  Zap,
  Calendar,
  Check,
  Loader2,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern (New York)" },
  { value: "America/Chicago", label: "Central (Chicago)" },
  { value: "America/Denver", label: "Mountain (Denver)" },
  { value: "America/Los_Angeles", label: "Pacific (Los Angeles)" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Australia/Sydney", label: "Sydney" },
];

const FREQUENCY_OPTIONS = [
  { value: 12, label: "Every 12 hours" },
  { value: 24, label: "Every 24 hours" },
  { value: 48, label: "Every 48 hours" },
  { value: 72, label: "Every 72 hours" },
];

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
  glow?: "emerald" | "violet" | "amber" | "rose" | "blue";
}) {
  const glowColors = {
    emerald: "shadow-emerald-500/20",
    violet: "shadow-violet-500/20",
    amber: "shadow-amber-500/20",
    rose: "shadow-rose-500/20",
    blue: "shadow-blue-500/20",
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
// Delete Account Modal
// ─────────────────────────────────────────────────────────────────────────────

function DeleteAccountModal({
  onClose,
  onConfirm,
  isPending,
}: {
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  const [confirmText, setConfirmText] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="animate-reveal relative w-full max-w-sm">
        <GlassCard className="p-6" glow="rose">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20">
            <AlertTriangle className="h-6 w-6 text-rose-400" />
          </div>
          <h3 className="mb-2 text-center text-lg font-semibold text-white">
            Delete Account
          </h3>
          <p className="mb-4 text-center text-sm text-white/60">
            This action is permanent. All your data including check-ins,
            contacts, and conversations will be deleted.
          </p>

          <div className="mb-4">
            <label className="mb-2 block text-sm text-white/60">
              Type &quot;DELETE&quot; to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors placeholder:text-white/30 focus:border-rose-500/50 focus:outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl bg-white/5 py-3 font-medium text-white/70 transition-colors hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={confirmText !== "DELETE" || isPending}
              className="flex-1 rounded-xl bg-rose-500 py-3 font-medium text-white transition-colors hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              ) : (
                "Delete Account"
              )}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Settings Row
// ─────────────────────────────────────────────────────────────────────────────

function SettingsRow({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon: typeof Clock;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-4 last:border-0">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
          <Icon className="h-5 w-5 text-white/60" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          {description && (
            <p className="text-xs text-white/40">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Profile Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const { data: session } = useSession();
  const utils = api.useUtils();
  const { data: profile, isLoading } = api.profile.get.useQuery();
  const { data: checkInStats } = api.checkIn.stats.useQuery();
  const { data: hasPasskeys } = api.passkey.hasPasskeys.useQuery();

  const [frequency, setFrequency] = useState(24);
  const [timezone, setTimezone] = useState("UTC");
  const [isActive, setIsActive] = useState(true);

  // Initialize form values when profile loads
  useEffect(() => {
    if (profile) {
      setFrequency(profile.checkInFrequencyHours);
      setTimezone(profile.timezone);
      setIsActive(profile.isActive);
    }
  }, [profile]);

  const updateProfile = api.profile.update.useMutation({
    onSuccess: async () => {
      await utils.profile.invalidate();
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    },
  });

  const deleteAccount = api.profile.delete.useMutation({
    onSuccess: () => {
      void signOut({ callbackUrl: "/" });
    },
  });

  const handleSave = () => {
    updateProfile.mutate({
      checkInFrequencyHours: frequency,
      timezone,
      isActive,
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const userName = session?.user?.name ?? "User";
  const userEmail = session?.user?.email ?? "";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#1a0533] via-[#2e026d] to-[#15162c]">
      {/* Animated Background Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -top-40 -right-40 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="animate-blob animation-delay-2000 absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="animate-blob animation-delay-4000 absolute right-1/4 bottom-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
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
            <p className="mb-2 text-xs font-medium tracking-[0.2em] text-violet-400/80 uppercase">
              Account
            </p>
            <h1 className="text-3xl font-bold text-white">Your Profile</h1>
          </div>

          {/* Loading */}
          {isLoading && (
            <GlassCard className="p-12">
              <div className="flex flex-col items-center">
                <Loader2 className="mb-4 h-8 w-8 animate-spin text-violet-400" />
                <p className="text-white/60">Loading profile...</p>
              </div>
            </GlassCard>
          )}

          {!isLoading && profile && (
            <>
              {/* Profile Card */}
              <div
                className={cn(
                  "mb-6 transition-all delay-100 duration-700",
                  mounted
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0",
                )}
              >
                <GlassCard className="p-6" glow="violet">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg shadow-violet-500/30">
                      <span className="text-2xl font-bold text-white">
                        {userInitial}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        {userName}
                      </h2>
                      <p className="text-white/50">{userEmail}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-white/5 p-3 text-center">
                      <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                        <Zap className="h-4 w-4 text-emerald-400" />
                      </div>
                      <p className="text-xl font-bold text-emerald-400">
                        {checkInStats?.totalCheckIns ?? 0}
                      </p>
                      <p className="text-xs text-white/50">Total Check-ins</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3 text-center">
                      <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
                        <Calendar className="h-4 w-4 text-amber-400" />
                      </div>
                      <p className="text-xl font-bold text-amber-400">
                        {checkInStats?.currentStreak ?? 0}
                      </p>
                      <p className="text-xs text-white/50">Day Streak</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3 text-center">
                      <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
                        <Heart className="h-4 w-4 text-violet-400" />
                      </div>
                      <p className="text-xl font-bold text-violet-400">
                        {isActive ? "Active" : "Paused"}
                      </p>
                      <p className="text-xs text-white/50">Status</p>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Settings Section */}
              <div
                className={cn(
                  "mb-6 transition-all delay-200 duration-700",
                  mounted
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0",
                )}
              >
                <div className="mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-white/60" />
                  <h2 className="text-lg font-semibold text-white">Settings</h2>
                </div>

                <GlassCard className="p-4">
                  {/* Check-in Frequency */}
                  <SettingsRow
                    icon={Clock}
                    label="Check-in Frequency"
                    description="How often ALVIN expects you to check in"
                  >
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(Number(e.target.value))}
                      className="cursor-pointer appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:outline-none"
                    >
                      {FREQUENCY_OPTIONS.map((opt) => (
                        <option
                          key={opt.value}
                          value={opt.value}
                          className="bg-[#1a1a2e]"
                        >
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </SettingsRow>

                  {/* Timezone */}
                  <SettingsRow
                    icon={Globe}
                    label="Timezone"
                    description="Used for reminders and alerts"
                  >
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="max-w-[140px] cursor-pointer appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:outline-none"
                    >
                      {TIMEZONES.map((tz) => (
                        <option
                          key={tz.value}
                          value={tz.value}
                          className="bg-[#1a1a2e]"
                        >
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </SettingsRow>

                  {/* Active Toggle */}
                  <SettingsRow
                    icon={Bell}
                    label="Monitoring Active"
                    description="ALVIN monitors your check-ins"
                  >
                    <button
                      onClick={() => setIsActive(!isActive)}
                      className={cn(
                        "relative h-6 w-11 rounded-full transition-colors",
                        isActive ? "bg-emerald-500" : "bg-white/20",
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-1 h-4 w-4 rounded-full bg-white transition-transform",
                          isActive ? "translate-x-6" : "translate-x-1",
                        )}
                      />
                    </button>
                  </SettingsRow>

                  {/* Save Button */}
                  <div className="pt-4">
                    <button
                      onClick={handleSave}
                      disabled={updateProfile.isPending}
                      className={cn(
                        "w-full rounded-xl py-3 font-medium transition-all",
                        "bg-gradient-to-r from-violet-500 to-violet-600",
                        "text-white shadow-lg shadow-violet-500/30",
                        "hover:shadow-violet-500/50",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "flex items-center justify-center gap-2",
                      )}
                    >
                      {updateProfile.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : showSaved ? (
                        <>
                          <Check className="h-5 w-5" />
                          Saved!
                        </>
                      ) : (
                        "Save Settings"
                      )}
                    </button>
                  </div>
                </GlassCard>
              </div>

              {/* Passkeys Section */}
              <div
                className={cn(
                  "mb-6 transition-all delay-300 duration-700",
                  mounted
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0",
                )}
              >
                <Link href="/profile/passkeys">
                  <GlassCard className="group p-4 transition-colors hover:border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
                          <Fingerprint className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            Biometric Login
                          </p>
                          <p className="text-xs text-white/50">
                            {hasPasskeys
                              ? "Passkeys configured"
                              : "Set up fingerprint or Face ID"}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-white/30 transition-colors group-hover:text-white/60" />
                    </div>
                  </GlassCard>
                </Link>
              </div>

              {/* Account Actions */}
              <div
                className={cn(
                  "space-y-3 transition-all delay-400 duration-700",
                  mounted
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0",
                )}
              >
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full"
                >
                  <GlassCard className="p-4 transition-colors hover:border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                        <LogOut className="h-5 w-5 text-white/60" />
                      </div>
                      <span className="font-medium text-white">Sign Out</span>
                    </div>
                  </GlassCard>
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full"
                >
                  <GlassCard className="p-4 transition-colors hover:border-rose-500/30">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20">
                        <Trash2 className="h-5 w-5 text-rose-400" />
                      </div>
                      <span className="font-medium text-rose-400">
                        Delete Account
                      </span>
                    </div>
                  </GlassCard>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => deleteAccount.mutate()}
          isPending={deleteAccount.isPending}
        />
      )}
    </div>
  );
}
