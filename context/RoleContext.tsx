"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSession } from "next-auth/react";

type AdminViewRole = "owner" | "manager";

interface RoleContextValue {
  role: AdminViewRole;
  canViewSalesReports: boolean;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const role: AdminViewRole =
    session?.user?.role === "owner" ? "owner" : "manager";

  return (
    <RoleContext.Provider
      value={{ role, canViewSalesReports: role === "owner" }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}
