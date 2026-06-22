"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { INITIAL_TICKETS } from "@/app/staffs/kitchenstaffs/data/mock";
import type { OrderStatus, Ticket } from "@/app/staffs/kitchenstaffs/types";

interface TicketsContextValue {
  tickets: Ticket[];
  advanceStatus: (ticketId: string, nextStatus: OrderStatus) => void;
}

const STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  new: "preparing",
  preparing: "ready",
  ready: "served",
  served: null,
};

const TicketsContext = createContext<TicketsContextValue | undefined>(undefined);

export function TicketsProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);

  const advanceStatus = (ticketId: string, nextStatus: OrderStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: nextStatus } : t))
    );
  };

  return (
    <TicketsContext.Provider value={{ tickets, advanceStatus }}>
      {children}
    </TicketsContext.Provider>
  );
}

export function useTickets() {
  const ctx = useContext(TicketsContext);
  if (!ctx) throw new Error("useTickets must be used within a TicketsProvider");
  return ctx;
}

export function getNextStatus(current: OrderStatus): OrderStatus | null {
  return STATUS_FLOW[current];
}
