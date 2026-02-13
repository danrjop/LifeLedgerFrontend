"use client";

import { useCookieConsent } from "@/lib/cookie-consent-context";

export default function CookieConsent() {
  const { hasConsented, isConsentLoading, acceptCookies } = useCookieConsent();

  if (isConsentLoading || hasConsented) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl bg-bg-secondary border border-bg-tertiary p-8 shadow-2xl">
        <h2 className="font-serif text-2xl text-fg-primary text-center mb-3">
          Cookie Notice
        </h2>
        <p className="text-sm text-fg-secondary text-center leading-relaxed mb-6">
          LifeLedger uses essential cookies to keep you securely signed in. These
          cookies are required for the site to function and do not track your
          browsing activity.
        </p>
        <button
          onClick={acceptCookies}
          className="w-full rounded-xl px-5 py-2.5 font-medium transition-all duration-200 ease-out min-h-11 flex items-center justify-center bg-accent text-accent-fg hover:bg-accent-hover motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Accept Cookies
        </button>
      </div>
    </div>
  );
}
