"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  UserPlus,
  Shield,
  ArrowLeft,
  ArrowRight,
  Info,
  ChevronDown,
  Bell,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Checkbox } from "~/components/ui/checkbox";

const RELATIONSHIP_OPTIONS = [
  { value: "spouse", label: "Spouse" },
  { value: "child", label: "Child" },
  { value: "sibling", label: "Sibling" },
  { value: "parent", label: "Parent" },
  { value: "friend", label: "Friend" },
  { value: "other", label: "Other" },
] as const;

export default function OnboardingContactPage() {
  const router = useRouter();
  const { update } = useSession();

  const advanceStep = api.profile.advanceOnboardingStep.useMutation();
  const createContact = api.contact.create.useMutation();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [relationshipOpen, setRelationshipOpen] = useState(false);

  // Notification toggles
  const [notifyMissedCheckin, setNotifyMissedCheckin] = useState(true);
  const [notifyExtendedAbsence, setNotifyExtendedAbsence] = useState(true);
  const [notifySos, setNotifySos] = useState(true);

  // Consent
  const [consentChecked, setConsentChecked] = useState(false);

  // Validation
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!consentChecked) {
      newErrors.consent = "You must confirm consent before saving";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    setHasAttemptedSubmit(true);

    if (!validate()) return;

    const hasSms = !!phone.trim() && notifyMissedCheckin;

    try {
      await createContact.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        relationship: relationship || undefined,
        priority: 1,
        notifyByEmail: true,
        notifyBySms: hasSms,
      });
      await advanceStep.mutateAsync({ step: 3 });
      await update();
      router.push("/onboarding/complete");
    } catch {
      // Error state is tracked by createContact.isError / advanceStep.isError
    }
  }

  async function handleSkip() {
    try {
      await advanceStep.mutateAsync({ step: 3 });
      await update();
      router.push("/onboarding/complete");
    } catch {
      // Error state is tracked by advanceStep.isError
    }
  }

  const isFormValid = name.trim() && email.trim() && consentChecked;

  const selectedRelationshipLabel = RELATIONSHIP_OPTIONS.find(
    (o) => o.value === relationship,
  )?.label;

  return (
    <div className="animate-fade-in flex w-full max-w-2xl flex-col items-center">
      <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20">
            <UserPlus className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Add an Emergency Contact
            </h1>
            <p className="mt-1 text-sm text-white/60">
              This person will be notified if you miss check-ins. You can add
              more contacts later.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label className="text-white/80">
              Name <span className="text-red-400">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contact's full name"
              className="rounded-lg border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-cyan-400/50"
            />
            {hasAttemptedSubmit && errors.name && (
              <p className="text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="text-white/80">
              Email <span className="text-red-400">*</span>
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@example.com"
              className="rounded-lg border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-cyan-400/50"
            />
            {hasAttemptedSubmit && errors.email && (
              <p className="text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label className="text-white/80">Phone (optional)</Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="rounded-lg border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-cyan-400/50"
            />
          </div>

          {/* Relationship */}
          <div className="space-y-2">
            <Label className="text-white/80">Relationship</Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setRelationshipOpen(!relationshipOpen)}
                className="flex h-9 w-full items-center justify-between rounded-lg border border-white/20 bg-white/5 px-3 text-sm text-white transition-colors hover:bg-white/10 focus:border-cyan-400/50 focus:outline-none"
              >
                <span
                  className={
                    selectedRelationshipLabel ? "text-white" : "text-white/40"
                  }
                >
                  {selectedRelationshipLabel ?? "Select relationship"}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-white/40 transition-transform ${
                    relationshipOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {relationshipOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-white/20 bg-slate-900/95 py-1 shadow-lg backdrop-blur-md">
                  {RELATIONSHIP_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setRelationship(option.value);
                        setRelationshipOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 ${
                        relationship === option.value
                          ? "text-cyan-400"
                          : "text-white/80"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="mt-6 border-t border-white/10 pt-6">
          <h2 className="mb-4 text-sm font-medium text-white/80">
            When should this contact be notified?
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-cyan-400" />
                <span className="text-sm text-white/80">
                  Missed check-in alert
                </span>
              </div>
              <Switch
                checked={notifyMissedCheckin}
                onCheckedChange={setNotifyMissedCheckin}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-white/80">
                  Extended absence (48h+)
                </span>
              </div>
              <Switch
                checked={notifyExtendedAbsence}
                onCheckedChange={setNotifyExtendedAbsence}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-sm text-white/80">SOS emergency</span>
              </div>
              <Switch checked={notifySos} onCheckedChange={setNotifySos} />
            </div>
          </div>
        </div>

        {/* Privacy Info */}
        <div className="mt-6 border-t border-white/10 pt-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium text-white/80">
                Your contact will only see:
              </span>
            </div>
            <ul className="mb-3 space-y-1 pl-6 text-sm text-white/60">
              <li className="list-disc">That you missed a check-in</li>
              <li className="list-disc">How long since your last activity</li>
              <li className="list-disc">Your preferred contact method</li>
            </ul>
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40" />
              <p className="text-xs text-white/40">
                They will NOT see your conversations or personal data.
              </p>
            </div>
          </div>
        </div>

        {/* Consent */}
        <div className="mt-6 border-t border-white/10 pt-6">
          <label className="flex cursor-pointer items-start gap-3">
            <Checkbox
              checked={consentChecked}
              onCheckedChange={(checked) => setConsentChecked(checked === true)}
              className="mt-0.5 border-white/30 data-[state=checked]:border-cyan-500 data-[state=checked]:bg-cyan-500"
            />
            <span className="text-sm text-white/70">
              I confirm this person has agreed to be my emergency contact
            </span>
          </label>
          {hasAttemptedSubmit && errors.consent && (
            <p className="mt-2 text-sm text-red-400">{errors.consent}</p>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/onboarding/preferences")}
            className="text-white/60 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={advanceStep.isPending}
              className="border-white/20 bg-transparent text-white/60 hover:text-white"
            >
              {advanceStep.isPending && !createContact.isPending
                ? "Skipping..."
                : "Skip for now"}
            </Button>

            <Button
              onClick={handleSave}
              disabled={
                !isFormValid || createContact.isPending || advanceStep.isPending
              }
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 disabled:opacity-50"
            >
              {createContact.isPending || advanceStep.isPending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : (
                <>
                  Save &amp; Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Mutation error */}
        {(createContact.isError || advanceStep.isError) && (
          <p className="mt-4 text-center text-sm text-red-400">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
