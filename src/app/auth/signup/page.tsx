"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { api } from "~/trpc/react";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function getPasswordStrength(password: string) {
  if (!password) return { level: 0, label: "" };

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasMinLength) return { level: 1, label: "Weak" };
  if (!hasNumber || !hasUppercase) return { level: 2, label: "Fair" };
  if (!hasSpecial) return { level: 3, label: "Good" };
  return { level: 4, label: "Strong" };
}

const strengthColors: Record<number, string> = {
  1: "bg-red-500",
  2: "bg-orange-500",
  3: "bg-yellow-500",
  4: "bg-emerald-500",
};

const strengthTextColors: Record<number, string> = {
  1: "text-red-400",
  2: "text-orange-400",
  3: "text-yellow-400",
  4: "text-emerald-400",
};

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const strength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword;
  const confirmStarted = confirmPassword.length > 0;

  const canSubmit =
    agreedToTerms && passwordsMatch && confirmStarted && !isGoogleLoading;

  const registerMutation = api.auth.register.useMutation({
    onSuccess: () => {
      router.push("/auth/signin?registered=true");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;

    registerMutation.mutate({
      email,
      password,
      name: name || undefined,
    });
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    await signIn("google", { callbackUrl: "/onboarding/welcome" });
  };

  return (
    <div className="animate-fade-in w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-md">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-white">Create Account</h1>
        <p className="mt-1 text-sm text-white/60">
          Join ALVIN and start your journey
        </p>
      </div>

      {/* Google OAuth */}
      <Button
        variant="outline"
        className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
        onClick={handleGoogleSignUp}
        disabled={isGoogleLoading || registerMutation.isPending}
      >
        {isGoogleLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white/10 px-3 text-white/60 backdrop-blur-sm">
            or create with email
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white/80">
            Full Name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Your full name"
            className="border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:ring-cyan-400/20"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/80">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:ring-cyan-400/20"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/80">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min 8 characters"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-white/20 bg-white/5 pr-10 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:ring-cyan-400/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-white/40 hover:text-white/70"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Password strength indicator */}
          {password.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((bar) => (
                  <div
                    key={bar}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      bar <= strength.level
                        ? strengthColors[strength.level]
                        : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <p
                className={`text-xs ${strengthTextColors[strength.level] ?? "text-white/40"}`}
              >
                {strength.label}
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="confirmPassword" className="text-white/80">
              Confirm Password
            </Label>
            {confirmStarted && (
              <span className="flex items-center gap-1">
                {passwordsMatch ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <X className="h-4 w-4 text-red-400" />
                )}
              </span>
            )}
          </div>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`border-white/20 bg-white/5 pr-10 text-white placeholder:text-white/40 focus:border-cyan-400/50 focus:ring-cyan-400/20 ${
                confirmStarted && !passwordsMatch ? "border-red-500/50" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-white/40 hover:text-white/70"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {confirmStarted && !passwordsMatch && (
            <p className="text-xs text-red-400">Passwords do not match</p>
          )}
        </div>

        {/* Terms checkbox */}
        <div className="flex items-start gap-3 pt-1">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
            className="mt-0.5 border-white/30 data-[state=checked]:border-cyan-400 data-[state=checked]:bg-cyan-400"
          />
          <label
            htmlFor="terms"
            className="cursor-pointer text-sm leading-snug text-white/60"
          >
            I agree to the{" "}
            <Link href="#" className="text-cyan-400 hover:text-cyan-300">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-cyan-400 hover:text-cyan-300">
              Privacy Policy
            </Link>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500"
          disabled={!canSubmit || registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Creating account...
            </div>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      {/* Footer link */}
      <p className="mt-6 text-center text-sm text-white/60">
        Already have an account?{" "}
        <Link href="/auth/signin" className="text-cyan-400 hover:text-cyan-300">
          Sign in
        </Link>
      </p>
    </div>
  );
}
