"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { getCurrentUser, type AuthUser } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { useCookieConsent } from "@/lib/cookie-consent-context";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  checkAuth: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { hasConsented } = useCookieConsent();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasConsented) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, [hasConsented, checkAuth]);

  useEffect(() => {
    if (!hasConsented) return;

    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      switch (payload.event) {
        case "signedIn":
          checkAuth();
          break;
        case "signedOut":
          setUser(null);
          setIsLoading(false);
          break;
        case "tokenRefresh":
          checkAuth();
          break;
        case "tokenRefresh_failure":
          setUser(null);
          setIsLoading(false);
          break;
      }
    });

    return unsubscribe;
  }, [hasConsented, checkAuth]);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
