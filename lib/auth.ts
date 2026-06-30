export type LoginMethod = "password" | "pin";

export type StaffRole =
  | "owner"
  | "manager"
  | "front_staff"
  | "kitchen"
  | "cashier";

export const ROLE_HOME: Record<StaffRole, string> = {
  owner: "/admin",
  manager: "/admin",
  front_staff: "/staff",
  kitchen: "/kitchen",
  cashier: "/cashier",
};
