"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "aws-amplify/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState("");

  const isFormValid =
    username.trim() !== "" &&
    email.trim() !== "" &&
    password.trim() !== "" &&
    verifyPassword.trim() !== "";

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError("");

    if (password !== verifyPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSigningUp(true);

    try {
      const result = await signUp({
        username: username.trim(),
        password: password,
        options: {
          userAttributes: {
            email: email.trim(),
          },
        },
      });

      if (result.isSignUpComplete) {
        router.push("/login");
      } else if (result.nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        router.push(
          `/verify-email?username=${encodeURIComponent(username.trim())}`
        );
      }
    } catch (err: unknown) {
      setIsSigningUp(false);
      if (err instanceof Error) {
        switch (err.name) {
          case "UsernameExistsException":
            setError("An account with this username already exists.");
            break;
          case "InvalidPasswordException":
            setError(
              "Password does not meet requirements. Use at least 8 characters with uppercase, lowercase, numbers, and symbols."
            );
            break;
          case "InvalidParameterException":
            setError("Please check your input and try again.");
            break;
          default:
            setError(err.message || "An unexpected error occurred.");
        }
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  if (isSigningUp) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <p className="text-body-lg text-fg-secondary">
          Signing up via AWS Cognito...
        </p>
      </div>
    );
  }

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

      {/* Sign Up Box — centered */}
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1
            className="font-serif text-fg-primary tracking-heading text-center"
            style={{ fontSize: "clamp(2.5rem, 2rem + 2vw, 4rem)" }}
          >
            Create your account
          </h1>

          <form onSubmit={handleSignUp} className="mt-8 space-y-5">
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
                placeholder="Choose a username"
                autoComplete="username"
                className="w-full rounded-xl bg-bg-primary border border-bg-tertiary px-4 py-2.5 text-fg-primary placeholder:text-fg-tertiary transition-colors duration-200 focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent-light"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-fg-secondary mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                className="w-full rounded-xl bg-bg-primary border border-bg-tertiary px-4 py-2.5 text-fg-primary placeholder:text-fg-tertiary transition-colors duration-200 focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent-light"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-fg-secondary mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                autoComplete="new-password"
                className="w-full rounded-xl bg-bg-primary border border-bg-tertiary px-4 py-2.5 text-fg-primary placeholder:text-fg-tertiary transition-colors duration-200 focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent-light"
              />
            </div>

            {/* Verify Password */}
            <div>
              <label
                htmlFor="verify-password"
                className="block text-sm font-medium text-fg-secondary mb-1.5"
              >
                Verify Password
              </label>
              <input
                id="verify-password"
                type="password"
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
                placeholder="Confirm your password"
                autoComplete="new-password"
                className="w-full rounded-xl bg-bg-primary border border-bg-tertiary px-4 py-2.5 text-fg-primary placeholder:text-fg-tertiary transition-colors duration-200 focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent-light"
              />
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={!isFormValid}
              className="w-full rounded-xl px-5 py-2.5 font-medium transition-all duration-200 ease-out min-h-11 flex items-center justify-center bg-accent text-accent-fg hover:bg-accent-hover motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Sign Up
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-fg-tertiary">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-accent hover:text-accent-hover font-medium transition-colors duration-200"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
