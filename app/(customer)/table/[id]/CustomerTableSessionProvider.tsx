"use client";

import { createContext, useContext, type ReactNode } from "react";

export type CustomerAssignedPackage = {
  id: string;
  name: string;
  description: string;
  price: number;
};

export type CustomerTableSessionContextValue = {
  table: {
    id: string;
    tableNumber: string;
  };
  session: {
    id: string;
    status: "seated" | "ordering" | "dining" | "finishedEating" | "paying";
    package: CustomerAssignedPackage | null;
  };
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
