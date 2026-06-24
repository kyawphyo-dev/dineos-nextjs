// Auth types — shared login, role-based redirect

import type { StaffRole } from "@/app/types/admin";

export type LoginMethod = "password" | "pin";

export type AuthUser = {
  id: string;
  name: string;
  role: StaffRole;
  email?: string;
  username?: string;
};

// Where each role lands after a successful login
export const ROLE_HOME: Record<StaffRole, string> = {
  owner: "/admin",
  manager: "/admin",
  front_staff: "/staff",
  kitchen: "/kitchen",
  cashier: "/cashier",
};
