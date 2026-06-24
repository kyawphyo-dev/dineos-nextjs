"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import type { AdminViewRole } from "@/app/types/admin";

interface RoleContextValue {
  role: AdminViewRole;
  canViewSalesReports: boolean;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

/**
 * Derives the admin-facing role (Owner/Manager) from the real signed-in
 * user via AuthContext. Replaces the old demo dropdown switcher now that
 * a real login page determines who's signed in.
 */
export function RoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const role: AdminViewRole = user?.role === "owner" ? "owner" : "manager";

  return (
    <RoleContext.Provider value={{ role, canViewSalesReports: role === "owner" }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}
