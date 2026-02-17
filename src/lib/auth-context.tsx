"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { getSessionAction, getIdTokenAction } from "@/lib/auth-actions";
import { useCookieConsent } from "@/lib/cookie-consent-context";
import { setTokenGetter } from "@/lib/api-client";

interface User {
  userId: string;
  username: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  checkAuth: async () => {},
  getIdToken: async () => null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { hasConsented } = useCookieConsent();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const result = await getSessionAction();
      if (result.success && result.user) {
        setUser(result.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getIdToken = useCallback(async () => {
    return getIdTokenAction();
  }, []);

  // Register token getter for api-client
  useEffect(() => {
    setTokenGetter(getIdToken);
  }, [getIdToken]);

  useEffect(() => {
    if (hasConsented) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, [hasConsented, checkAuth]);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, checkAuth, getIdToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
