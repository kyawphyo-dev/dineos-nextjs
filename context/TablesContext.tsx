"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { INITIAL_TABLES } from "@/app/staffs/frontstaffs/data/mock";
import type { RestaurantTable, TableSession } from "@/app/staffs/frontstaffs/types";

interface TablesContextValue {
  tables: RestaurantTable[];
  getTable: (id: string) => RestaurantTable | undefined;
  startSession: (tableId: string, session: TableSession) => void;
  closeSession: (tableId: string) => void;
}

const TablesContext = createContext<TablesContextValue | undefined>(undefined);

export function TablesProvider({ children }: { children: ReactNode }) {
  const [tables, setTables] = useState<RestaurantTable[]>(INITIAL_TABLES);

  const getTable = (id: string) => tables.find((t) => t.id === id);

  const startSession = (tableId: string, session: TableSession) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, status: "occupied", meta: "Seated just now", session }
          : t
      )
    );
  };

  const closeSession = (tableId: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, status: "available", meta: `${t.seats} seats`, session: undefined }
          : t
      )
    );
  };

  return (
    <TablesContext.Provider value={{ tables, getTable, startSession, closeSession }}>
      {children}
    </TablesContext.Provider>
  );
}

export function useTables() {
  const ctx = useContext(TablesContext);
  if (!ctx) throw new Error("useTables must be used within a TablesProvider");
  return ctx;
}
