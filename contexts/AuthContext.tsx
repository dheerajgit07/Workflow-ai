"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
interface UserType {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  color?: string;
}
interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  authenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Session check failed:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    checkSession();
  }, []);
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        router.push("/dashboard");
        return { success: true };
      } else {
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (err) {
      return { success: false, error: "Network error during login" };
    }
  };
  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        router.push("/dashboard");
        return { success: true };
      } else {
        return { success: false, error: data.error || "Registration failed" };
      }
    } catch (err) {
      return { success: false, error: "Network error during registration" };
    }
  };
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authenticated: !!user,
        login,
        register,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
