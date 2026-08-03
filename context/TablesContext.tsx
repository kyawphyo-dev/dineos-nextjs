"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { INITIAL_TABLES } from "@/app/data/staff-mock";
import type { FrontTable, Reservation, TableSession } from "@/app/types/staff";

interface TablesContextValue {
  tables: FrontTable[];
  getTable: (id: string) => FrontTable | undefined;
  startSession: (tableId: string, session: TableSession) => void;
  closeSession: (tableId: string) => void;
  reserveTable: (tableId: string, reservation: Reservation) => void;
  cancelReservation: (tableId: string) => void;
}

const TablesContext = createContext<TablesContextValue | undefined>(undefined);

export function TablesProvider({ children }: { children: ReactNode }) {
  const [tables, setTables] = useState<FrontTable[]>(INITIAL_TABLES);

  const getTable = (id: string) => tables.find((t) => t.id === id);

  const startSession = (tableId: string, session: TableSession) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, status: "occupied", meta: "Seated just now", session, reservation: undefined }
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

  const reserveTable = (tableId: string, reservation: Reservation) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: "reserved",
              meta: `Reserved ${formatReservationTime(reservation.reservedTime)}`,
              reservation,
            }
          : t
      )
    );
  };

  const cancelReservation = (tableId: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, status: "available", meta: `${t.seats} seats`, reservation: undefined }
          : t
      )
    );
  };

  return (
    <TablesContext.Provider
      value={{ tables, getTable, startSession, closeSession, reserveTable, cancelReservation }}
    >
      {children}
    </TablesContext.Provider>
  );
}

export function useTables() {
  const ctx = useContext(TablesContext);
  if (!ctx) throw new Error("useTables must be used within a TablesProvider");
  return ctx;
}

function formatReservationTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
