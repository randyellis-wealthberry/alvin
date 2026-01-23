"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
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
} from "lucide-react"
import { api } from "~/trpc/react"
import { cn } from "~/lib/utils"

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
]

const FREQUENCY_OPTIONS = [
  { value: 12, label: "Every 12 hours" },
  { value: 24, label: "Every 24 hours" },
  { value: 48, label: "Every 48 hours" },
  { value: 72, label: "Every 72 hours" },
]

// ─────────────────────────────────────────────────────────────────────────────
// GlassCard Component
// ─────────────────────────────────────────────────────────────────────────────

function GlassCard({
  children,
  className,
  glow,
}: {
  children: React.ReactNode
  className?: string
  glow?: "emerald" | "violet" | "amber" | "rose" | "blue"
}) {
  const glowColors = {
    emerald: "shadow-emerald-500/20",
    violet: "shadow-violet-500/20",
    amber: "shadow-amber-500/20",
    rose: "shadow-rose-500/20",
    blue: "shadow-blue-500/20",
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-white/[0.03] backdrop-blur-xl",
        "border border-white/[0.05]",
        glow && `shadow-2xl ${glowColors[glow]}`,
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      <div className="relative">{children}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete Account Modal
// ─────────────────────────────────────────────────────────────────────────────

function DeleteAccountModal({
  onClose,
  onConfirm,
  isPending,
}: {
  onClose: () => void
  onConfirm: () => void
  isPending: boolean
}) {
  const [confirmText, setConfirmText] = useState("")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm animate-reveal">
        <GlassCard className="p-6" glow="rose">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
          </div>
          <h3 className="text-lg font-semibold text-white text-center mb-2">
            Delete Account
          </h3>
          <p className="text-white/60 text-center text-sm mb-4">
            This action is permanent. All your data including check-ins, contacts, and conversations will be deleted.
          </p>

          <div className="mb-4">
            <label className="block text-sm text-white/60 mb-2">
              Type &quot;DELETE&quot; to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-rose-500/50 transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-white/5 text-white/70 font-medium hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={confirmText !== "DELETE" || isPending}
              className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-medium hover:bg-rose-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 mx-auto animate-spin" />
              ) : (
                "Delete Account"
              )}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  )
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
  icon: typeof Clock
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
          <Icon className="w-5 h-5 text-white/60" />
        </div>
        <div>
          <p className="text-sm text-white font-medium">{label}</p>
          {description && (
            <p className="text-xs text-white/40">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Profile Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSaved, setShowSaved] = useState(false)

  const { data: session } = useSession()
  const utils = api.useUtils()
  const { data: profile, isLoading } = api.profile.get.useQuery()
  const { data: checkInStats } = api.checkIn.stats.useQuery()
  const { data: hasPasskeys } = api.passkey.hasPasskeys.useQuery()

  const [frequency, setFrequency] = useState(24)
  const [timezone, setTimezone] = useState("UTC")
  const [isActive, setIsActive] = useState(true)

  // Initialize form values when profile loads
  useEffect(() => {
    if (profile) {
      setFrequency(profile.checkInFrequencyHours)
      setTimezone(profile.timezone)
      setIsActive(profile.isActive)
    }
  }, [profile])

  const updateProfile = api.profile.update.useMutation({
    onSuccess: async () => {
      await utils.profile.invalidate()
      setShowSaved(true)
      setTimeout(() => setShowSaved(false), 2000)
    },
  })

  const deleteAccount = api.profile.delete.useMutation({
    onSuccess: () => {
      void signOut({ callbackUrl: "/" })
    },
  })

  const handleSave = () => {
    updateProfile.mutate({
      checkInFrequencyHours: frequency,
      timezone,
      isActive,
    })
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  const userName = session?.user?.name ?? "User"
  const userEmail = session?.user?.email ?? ""
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#1a0533] via-[#2e026d] to-[#15162c]">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 px-4 pt-8 pb-32">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div
            className={cn(
              "mb-8 transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <p className="text-xs font-medium tracking-[0.2em] text-violet-400/80 uppercase mb-2">
              Account
            </p>
            <h1 className="text-3xl font-bold text-white">Your Profile</h1>
          </div>

          {/* Loading */}
          {isLoading && (
            <GlassCard className="p-12">
              <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-violet-400 animate-spin mb-4" />
                <p className="text-white/60">Loading profile...</p>
              </div>
            </GlassCard>
          )}

          {!isLoading && profile && (
            <>
              {/* Profile Card */}
              <div
                className={cn(
                  "mb-6 transition-all duration-700 delay-100",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
              >
                <GlassCard className="p-6" glow="violet">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
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
                    <div className="text-center p-3 rounded-xl bg-white/5">
                      <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-lg bg-emerald-500/20">
                        <Zap className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-xl font-bold text-emerald-400">
                        {checkInStats?.totalCheckIns ?? 0}
                      </p>
                      <p className="text-xs text-white/50">Total Check-ins</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-white/5">
                      <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-lg bg-amber-500/20">
                        <Calendar className="w-4 h-4 text-amber-400" />
                      </div>
                      <p className="text-xl font-bold text-amber-400">
                        {checkInStats?.currentStreak ?? 0}
                      </p>
                      <p className="text-xs text-white/50">Day Streak</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-white/5">
                      <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-lg bg-violet-500/20">
                        <Heart className="w-4 h-4 text-violet-400" />
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
                  "mb-6 transition-all duration-700 delay-200",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-white/60" />
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
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50 appearance-none cursor-pointer"
                    >
                      {FREQUENCY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#1a1a2e]">
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
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50 appearance-none cursor-pointer max-w-[140px]"
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz.value} value={tz.value} className="bg-[#1a1a2e]">
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
                        "w-11 h-6 rounded-full transition-colors relative",
                        isActive ? "bg-emerald-500" : "bg-white/20"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                          isActive ? "translate-x-6" : "translate-x-1"
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
                        "w-full py-3 rounded-xl font-medium transition-all",
                        "bg-gradient-to-r from-violet-500 to-violet-600",
                        "text-white shadow-lg shadow-violet-500/30",
                        "hover:shadow-violet-500/50",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "flex items-center justify-center gap-2"
                      )}
                    >
                      {updateProfile.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : showSaved ? (
                        <>
                          <Check className="w-5 h-5" />
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
                  "mb-6 transition-all duration-700 delay-300",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
              >
                <Link href="/profile/passkeys">
                  <GlassCard className="p-4 hover:border-white/10 transition-colors group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                          <Fingerprint className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Biometric Login</p>
                          <p className="text-xs text-white/50">
                            {hasPasskeys
                              ? "Passkeys configured"
                              : "Set up fingerprint or Face ID"}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
                    </div>
                  </GlassCard>
                </Link>
              </div>

              {/* Account Actions */}
              <div
                className={cn(
                  "space-y-3 transition-all duration-700 delay-400",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
              >
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full"
                >
                  <GlassCard className="p-4 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        <LogOut className="w-5 h-5 text-white/60" />
                      </div>
                      <span className="text-white font-medium">Sign Out</span>
                    </div>
                  </GlassCard>
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full"
                >
                  <GlassCard className="p-4 hover:border-rose-500/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-rose-400" />
                      </div>
                      <span className="text-rose-400 font-medium">Delete Account</span>
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
  )
}
