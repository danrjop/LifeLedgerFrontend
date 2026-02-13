"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

const CONSENT_KEY = "lifeledger_cookie_consent";

interface CookieConsentContextType {
  hasConsented: boolean;
  isConsentLoading: boolean;
  acceptCookies: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType>({
  hasConsented: false,
  isConsentLoading: true,
  acceptCookies: () => {},
});

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [hasConsented, setHasConsented] = useState(false);
  const [isConsentLoading, setIsConsentLoading] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (consent === "true") {
      setHasConsented(true);
    }
    setIsConsentLoading(false);
  }, []);

  const acceptCookies = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, "true");
    setHasConsented(true);
  }, []);

  return (
    <CookieConsentContext.Provider
      value={{ hasConsented, isConsentLoading, acceptCookies }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  return useContext(CookieConsentContext);
}
