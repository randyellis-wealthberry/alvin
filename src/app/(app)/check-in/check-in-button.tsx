"use client"

import { useState, useEffect } from "react"
import { startAuthentication } from "@simplewebauthn/browser"
import Link from "next/link"
import { Fingerprint, ArrowRight, Check, Loader2 } from "lucide-react"
import { api } from "~/trpc/react"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

export function CheckInButton() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [biometricError, setBiometricError] = useState<string | null>(null)
  const [isBiometricLoading, setIsBiometricLoading] = useState(false)
  const utils = api.useUtils()

  // Check if user has passkeys registered
  const { data: hasPasskeys } = api.passkey.hasPasskeys.useQuery()

  // Manual check-in mutation
  const recordCheckIn = api.checkIn.record.useMutation({
    onSuccess: () => {
      setShowSuccess(true)
      void utils.checkIn.list.invalidate()
    },
  })

  // Biometric check-in mutations
  const generateAuthOptions =
    api.passkey.generateAuthenticationOptions.useMutation()
  const verifyAuth = api.passkey.verifyAuthentication.useMutation({
    onSuccess: () => {
      setShowSuccess(true)
      void utils.checkIn.list.invalidate()
      void utils.passkey.hasPasskeys.invalidate()
    },
  })

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [showSuccess])

  const handleBiometricCheckIn = async () => {
    setBiometricError(null)
    setIsBiometricLoading(true)

    try {
      const options = await generateAuthOptions.mutateAsync()
      let authResponse
      try {
        authResponse = await startAuthentication(options)
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === "NotAllowedError") {
            setBiometricError("Authentication cancelled. Please try again.")
            return
          }
          setBiometricError(err.message)
          return
        }
        setBiometricError("Authentication failed. Please try again.")
        return
      }
      await verifyAuth.mutateAsync({ response: authResponse })
    } catch (err) {
      setBiometricError(err instanceof Error ? err.message : "Check-in failed")
    } finally {
      setIsBiometricLoading(false)
    }
  }

  const isPending = recordCheckIn.isPending || isBiometricLoading

  return (
    <div className="flex flex-col items-center">
      {/* Action Buttons */}
      <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
        {/* Manual "I'm OK" Button */}
        <button
          onClick={() => recordCheckIn.mutate()}
          disabled={isPending || showSuccess}
          className={cn(
            "group relative flex h-32 w-32 flex-col items-center justify-center rounded-full",
            "bg-green-600 text-white shadow-lg shadow-green-500/25",
            "transition-all duration-200",
            "hover:bg-green-500 hover:shadow-green-500/40 hover:shadow-xl",
            "active:scale-95",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {recordCheckIn.isPending ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : showSuccess ? (
            <Check className="h-10 w-10" strokeWidth={3} />
          ) : (
            <span className="text-xl font-bold">I&apos;m OK</span>
          )}
          <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>

        {/* Biometric Button - only shown if user has passkeys */}
        {hasPasskeys && (
          <button
            onClick={handleBiometricCheckIn}
            disabled={isPending || showSuccess}
            className={cn(
              "group relative flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-full",
              "bg-blue-600 text-white shadow-lg shadow-blue-500/25",
              "transition-all duration-200",
              "hover:bg-blue-500 hover:shadow-blue-500/40 hover:shadow-xl",
              "active:scale-95",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {isBiometricLoading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : showSuccess ? (
              <Check className="h-10 w-10" strokeWidth={3} />
            ) : (
              <>
                <Fingerprint className="h-8 w-8" strokeWidth={1.5} />
                <span className="text-sm font-medium">Biometric</span>
              </>
            )}
            <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        )}
      </div>

      {/* Success Message */}
      {showSuccess && (
        <p className="mb-4 text-lg font-semibold text-green-400">Checked in!</p>
      )}

      {/* Error Messages */}
      {recordCheckIn.isError && (
        <p className="mb-4 text-red-400">
          Error: {recordCheckIn.error.message}
        </p>
      )}
      {biometricError && (
        <p className="mb-4 text-red-400">Error: {biometricError}</p>
      )}

      {/* Set up biometric link - shown when no passkeys */}
      {hasPasskeys === false && (
        <div className="text-center">
          <Button
            asChild
            variant="link"
            className="text-white/70 hover:text-white"
          >
            <Link
              href="/profile/passkeys"
              className="inline-flex items-center gap-1"
            >
              Set up biometric check-in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
