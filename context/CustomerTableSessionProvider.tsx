"use client";

import { createContext, useContext, type ReactNode } from "react";
import type {
  CustomerTableCategory,
  CustomerTableOrder,
} from "@/lib/actions/customer/GetCustomerTableSession.action";

export type CustomerAssignedPackage = {
  id: string;
  name: string;
  description: string;
  price: number;
};

export type CustomerRestaurantInfo = {
  id: string;
  name: string;
};

export type CustomerBranchInfo = {
  id: string;
  name: string;
  location: string | null;
};

export type CustomerTableInfo = {
  id: string;
  tableNumber: string;
  capacity: number;
};

export type CustomerSessionInfo = {
  id: string;
  status: "seated" | "ordering" | "dining" | "finishedEating" | "paying";
  startedAt: string;
  guestCount: number;
  package: CustomerAssignedPackage | null;
};

export type CustomerTableSessionContextValue = {
  restaurant: CustomerRestaurantInfo;
  branch: CustomerBranchInfo;
  table: CustomerTableInfo;
  session: CustomerSessionInfo;
  categories: CustomerTableCategory[];
  orders: CustomerTableOrder[];
};

const CustomerTableSessionContext = createContext<
  CustomerTableSessionContextValue | undefined
>(undefined);

export default function CustomerTableSessionProvider({
  value,
  children,
}: {
  value: CustomerTableSessionContextValue;
  children: ReactNode;
}) {
  return (
    <CustomerTableSessionContext.Provider value={value}>
      {children}
    </CustomerTableSessionContext.Provider>
  );
}

export function useCustomerTableSession() {
  const ctx = useContext(CustomerTableSessionContext);
  if (!ctx) {
    throw new Error(
      "useCustomerTableSession must be used within CustomerTableSessionProvider",
    );
  }
  return ctx;
}
