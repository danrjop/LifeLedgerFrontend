"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { confirmSignUpAction, resendCodeAction } from "@/lib/auth-actions";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const isFormValid = code.trim().length === 6 && username.trim() !== "";

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError("");
    setResendMessage("");
    setIsVerifying(true);

    const result = await confirmSignUpAction(username.trim(), code.trim());

    if (result.success) {
      router.push("/login");
    } else {
      setIsVerifying(false);
      setError(result.error || "Verification failed.");
    }
  };

  const handleResendCode = async () => {
    setError("");
    setResendMessage("");
    const result = await resendCodeAction(username.trim());

    if (result.success) {
      setResendMessage(
        "A new verification code has been sent to your email."
      );
    } else {
      setError(result.error || "Failed to resend code.");
    }
  };

  return (
    <div className="w-full max-w-sm">
      <h1
        className="font-serif text-fg-primary tracking-heading text-center"
        style={{ fontSize: "clamp(2.5rem, 2rem + 2vw, 4rem)" }}
      >
        Verify your email
      </h1>

      <p className="mt-3 text-center text-sm text-fg-secondary">
        We sent a 6-digit verification code to your email. Enter it below to
        confirm your account.
      </p>

      <form onSubmit={handleVerify} className="mt-8 space-y-5">
        {error && (
          <div className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {resendMessage && (
          <div className="rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">
            {resendMessage}
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

        {/* Verify Button */}
        <button
          type="submit"
          disabled={!isFormValid || isVerifying}
          className="w-full rounded-xl px-5 py-2.5 font-medium transition-all duration-200 ease-out min-h-11 flex items-center justify-center bg-accent text-accent-fg hover:bg-accent-hover motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isVerifying ? "Verifying..." : "Verify Email"}
        </button>
      </form>

      {/* Resend Code */}
      <p className="mt-6 text-center text-sm text-fg-tertiary">
        Didn&apos;t receive a code?{" "}
        <button
          onClick={handleResendCode}
          className="text-accent hover:text-accent-hover font-medium transition-colors duration-200"
        >
          Resend code
        </button>
      </p>

      {/* Back to Login */}
      <p className="mt-3 text-center text-sm text-fg-tertiary">
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

export default function VerifyEmailPage() {
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

      {/* Verify Email Box — centered */}
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <Suspense>
          <VerifyEmailForm />
        </Suspense>
      </div>
    </div>
  );
}
