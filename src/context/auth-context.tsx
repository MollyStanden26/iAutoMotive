"use client";

import { createContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { User, UserRole } from "@/types/user";
import { ROLE_HOME_ROUTE } from "@/lib/auth/role-routes";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "seller" | "buyer";
}

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; redirectTo?: string }>;
  signUp: (data: RegisterData) => Promise<{ success: boolean; error?: string; redirectTo?: string }>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Hydrate session from JWT cookie via API
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then(({ user: sessionUser }) => {
        if (sessionUser) setUser(sessionUser as User);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || "Invalid email or password" };
      }

      setUser(data.user as User);
      return { success: true, redirectTo: ROLE_HOME_ROUTE[data.user.role as UserRole] };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  }, []);

  const signUp = useCallback(async (data: RegisterData) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        return { success: false, error: result.error || "Registration failed" };
      }

      setUser(result.user as User);
      return { success: true, redirectTo: ROLE_HOME_ROUTE[result.user.role as UserRole] };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/signout", { method: "POST" }).catch(() => {});
    setUser(null);
    router.push("/");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
