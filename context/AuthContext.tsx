"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { DEMO_ACCOUNTS } from "@/app/data/auth-mock";
import type { AuthUser, LoginMethod } from "@/app/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  loginWithPassword: (email: string, password: string) => { ok: boolean; user?: AuthUser; reason?: string };
  loginWithPin: (username: string, pin: string) => { ok: boolean; user?: AuthUser; reason?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const loginWithPassword = (email: string, password: string) => {
    const account = DEMO_ACCOUNTS.find(
      (a) => a.email?.toLowerCase() === email.trim().toLowerCase()
    );
    if (!account || account.password !== password) {
      return { ok: false, reason: "Incorrect email or password." };
    }
    const authUser: AuthUser = { id: account.id, name: account.name, role: account.role, email: account.email };
    setUser(authUser);
    return { ok: true, user: authUser };
  };

  const loginWithPin = (username: string, pin: string) => {
    const account = DEMO_ACCOUNTS.find(
      (a) => a.username?.toLowerCase() === username.trim().toLowerCase()
    );
    if (!account || account.pin !== pin) {
      return { ok: false, reason: "Incorrect username or PIN." };
    }
    const authUser: AuthUser = { id: account.id, name: account.name, role: account.role, username: account.username };
    setUser(authUser);
    return { ok: true, user: authUser };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loginWithPassword, loginWithPin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export type { LoginMethod };
