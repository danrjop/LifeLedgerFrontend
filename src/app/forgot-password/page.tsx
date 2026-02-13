"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "aws-amplify/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = username.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError("");
    setIsSubmitting(true);

    try {
      const result = await resetPassword({ username: username.trim() });

      if (
        result.nextStep.resetPasswordStep ===
        "CONFIRM_RESET_PASSWORD_WITH_CODE"
      ) {
        router.push(
          `/reset-password?username=${encodeURIComponent(username.trim())}`
        );
      }
    } catch (err: unknown) {
      setIsSubmitting(false);
      if (err instanceof Error) {
        switch (err.name) {
          case "UserNotFoundException":
            // Don't reveal whether user exists — still redirect
            router.push(
              `/reset-password?username=${encodeURIComponent(username.trim())}`
            );
            break;
          case "LimitExceededException":
            setError("Too many attempts. Please wait before trying again.");
            break;
          default:
            setError(err.message || "Something went wrong.");
        }
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

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

      {/* Forgot Password Box — centered */}
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1
            className="font-serif text-fg-primary tracking-heading text-center"
            style={{ fontSize: "clamp(2.5rem, 2rem + 2vw, 4rem)" }}
          >
            Forgot password
          </h1>

          <p className="mt-3 text-center text-sm text-fg-secondary">
            Enter your username and we&apos;ll send a verification code to your
            email to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-fg-secondary mb-1.5"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                className="w-full rounded-xl bg-bg-primary border border-bg-tertiary px-4 py-2.5 text-fg-primary placeholder:text-fg-tertiary transition-colors duration-200 focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent-light"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="w-full rounded-xl px-5 py-2.5 font-medium transition-all duration-200 ease-out min-h-11 flex items-center justify-center bg-accent text-accent-fg hover:bg-accent-hover motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? "Sending..." : "Send Reset Code"}
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
      </div>
    </div>
  );
}
