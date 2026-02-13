"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUpAction } from "@/lib/auth-actions";

export default function SignUpPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isFormValid =
    username.trim() !== "" &&
    email.trim() !== "" &&
    password.trim() !== "" &&
    verifyPassword.trim() !== "";

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const fieldError = (field: string, value: string) => {
    if (!touched[field] || value.trim() !== "") return null;
    return "This field is required.";
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      username: true,
      email: true,
      password: true,
      verifyPassword: true,
    });
    if (!isFormValid) return;
    setError("");

    if (password !== verifyPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSigningUp(true);

    const result = await signUpAction(username.trim(), password, email.trim());

    if (result.success && result.nextStep === "CONFIRM_SIGN_UP") {
      router.push(
        `/verify-email?username=${encodeURIComponent(username.trim())}`
      );
    } else if (result.success) {
      router.push("/login");
    } else {
      setIsSigningUp(false);
      setError(result.error || "An unexpected error occurred.");
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

  const inputClass = (field: string, value: string) =>
    `w-full rounded-xl bg-bg-primary border px-4 py-2.5 text-fg-primary placeholder:text-fg-tertiary transition-colors duration-200 focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent-light ${
      touched[field] && value.trim() === ""
        ? "border-danger"
        : "border-bg-tertiary"
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      {/* Logo — top left */}
      <div className="px-8 py-4">
        <Link
          href="/"
          className="text-xl font-semibold text-fg-primary tracking-tight"
          aria-label="LifeLedger home"
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

          <form onSubmit={handleSignUp} className="mt-8 space-y-5" noValidate>
            {error && (
              <div
                role="alert"
                className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger"
              >
                {error}
              </div>
            )}

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-fg-secondary mb-1.5"
              >
                Username <span className="text-danger">*</span>
              </label>
              <input
                id="username"
                type="text"
                required
                aria-required="true"
                aria-invalid={touched.username && username.trim() === ""}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => handleBlur("username")}
                placeholder="Choose a username"
                autoComplete="username"
                className={inputClass("username", username)}
              />
              {fieldError("username", username) && (
                <p className="mt-1 text-xs text-danger" role="alert">
                  {fieldError("username", username)}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-fg-secondary mb-1.5"
              >
                Email <span className="text-danger">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                aria-required="true"
                aria-invalid={touched.email && email.trim() === ""}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur("email")}
                placeholder="Enter your email"
                autoComplete="email"
                className={inputClass("email", email)}
              />
              {fieldError("email", email) && (
                <p className="mt-1 text-xs text-danger" role="alert">
                  {fieldError("email", email)}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-fg-secondary mb-1.5"
              >
                Password <span className="text-danger">*</span>
              </label>
              <input
                id="password"
                type="password"
                required
                aria-required="true"
                aria-invalid={touched.password && password.trim() === ""}
                aria-describedby="password-requirements"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
                placeholder="Create a password"
                autoComplete="new-password"
                className={inputClass("password", password)}
              />
              {fieldError("password", password) && (
                <p className="mt-1 text-xs text-danger" role="alert">
                  {fieldError("password", password)}
                </p>
              )}
              <ul
                id="password-requirements"
                className="mt-2 space-y-0.5 text-xs text-fg-tertiary"
              >
                <li>At least 8 characters</li>
                <li>At least one uppercase letter</li>
                <li>At least one lowercase letter</li>
                <li>At least one number</li>
                <li>At least one special character (!@#$%^&* etc.)</li>
              </ul>
            </div>

            {/* Verify Password */}
            <div>
              <label
                htmlFor="verify-password"
                className="block text-sm font-medium text-fg-secondary mb-1.5"
              >
                Verify Password <span className="text-danger">*</span>
              </label>
              <input
                id="verify-password"
                type="password"
                required
                aria-required="true"
                aria-invalid={
                  touched.verifyPassword && verifyPassword.trim() === ""
                }
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
                onBlur={() => handleBlur("verifyPassword")}
                placeholder="Confirm your password"
                autoComplete="new-password"
                className={inputClass("verifyPassword", verifyPassword)}
              />
              {fieldError("verifyPassword", verifyPassword) && (
                <p className="mt-1 text-xs text-danger" role="alert">
                  {fieldError("verifyPassword", verifyPassword)}
                </p>
              )}
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
