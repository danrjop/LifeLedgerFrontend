"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { confirmResetPasswordAction } from "@/lib/auth-actions";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "";

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid =
    code.trim().length === 6 &&
    newPassword.trim() !== "" &&
    confirmPassword.trim() !== "" &&
    username.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const result = await confirmResetPasswordAction(
      username.trim(),
      code.trim(),
      newPassword
    );

    if (result.success) {
      router.push("/login");
    } else {
      setIsSubmitting(false);
      setError(result.error || "Password reset failed.");
    }
  };

  return (
    <div className="w-full max-w-sm">
      <h1
        className="font-serif text-fg-primary tracking-heading text-center"
        style={{ fontSize: "clamp(2.5rem, 2rem + 2vw, 4rem)" }}
      >
        Reset password
      </h1>

      <p className="mt-3 text-center text-sm text-fg-secondary">
        Enter the verification code sent to your email along with your new
        password.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <div className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {/* Verification Code */}
        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-fg-secondary mb-1.5"
          >
            Verification Code
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="Enter 6-digit code"
            autoComplete="one-time-code"
            className="w-full rounded-xl bg-bg-primary border border-bg-tertiary px-4 py-2.5 text-fg-primary placeholder:text-fg-tertiary transition-colors duration-200 focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent-light tracking-widest text-center text-lg"
          />
        </div>

        {/* New Password */}
        <div>
          <label
            htmlFor="new-password"
            className="block text-sm font-medium text-fg-secondary mb-1.5"
          >
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            autoComplete="new-password"
            className="w-full rounded-xl bg-bg-primary border border-bg-tertiary px-4 py-2.5 text-fg-primary placeholder:text-fg-tertiary transition-colors duration-200 focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent-light"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirm-password"
            className="block text-sm font-medium text-fg-secondary mb-1.5"
          >
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            autoComplete="new-password"
            className="w-full rounded-xl bg-bg-primary border border-bg-tertiary px-4 py-2.5 text-fg-primary placeholder:text-fg-tertiary transition-colors duration-200 focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent-light"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="w-full rounded-xl px-5 py-2.5 font-medium transition-all duration-200 ease-out min-h-11 flex items-center justify-center bg-accent text-accent-fg hover:bg-accent-hover motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      {/* Back to Login */}
      <p className="mt-6 text-center text-sm text-fg-tertiary">
        <Link
          href="/login"
          className="text-accent hover:text-accent-hover font-medium transition-colors duration-200"
        >
          Back to login
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      {/* Logo — top left */}
      <div className="px-8 py-4">
        <Link
          href="/"
          className="text-xl font-semibold text-fg-primary tracking-tight"
        >
          LifeLedger
        </Link>
      </div>

      {/* Reset Password Box — centered */}
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
