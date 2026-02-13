"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { getSessionAction } from "@/lib/auth-actions";
import { useCookieConsent } from "@/lib/cookie-consent-context";

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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  checkAuth: async () => {},
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

  useEffect(() => {
    if (hasConsented) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
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
