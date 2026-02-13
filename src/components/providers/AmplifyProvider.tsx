"use client";

import { useRef } from "react";
import { configureAmplify } from "@/lib/amplify-config";
import { useCookieConsent } from "@/lib/cookie-consent-context";

export default function AmplifyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hasConsented } = useCookieConsent();
  const configured = useRef(false);

  if (hasConsented && !configured.current) {
    configureAmplify();
    configured.current = true;
  }

  return <>{children}</>;
}
