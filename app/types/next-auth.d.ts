import { DefaultSession } from "next-auth";

type StaffRole = "owner" | "manager" | "front_staff" | "kitchen" | "cashier";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: StaffRole;
      branchId: string | null;
      restaurantId: string | null;
      companyId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: StaffRole;
    branchId: string | null;
    restaurantId: string | null;
    companyId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: StaffRole;
    branchId: string | null;
    restaurantId: string | null;
    companyId: string | null;
  }
}
