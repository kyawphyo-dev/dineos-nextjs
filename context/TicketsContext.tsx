"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { INITIAL_TICKETS } from "@/app/data/kitchen-mock";
import type { TicketStatus, Ticket } from "@/app/types/kitchen";

interface TicketsContextValue {
  tickets: Ticket[];
  advanceStatus: (ticketId: string, nextStatus: TicketStatus) => void;
}

const STATUS_FLOW: Record<TicketStatus, TicketStatus | null> = {
  new: "preparing",
  preparing: "ready",
  ready: "served",
  served: null,
};

const TicketsContext = createContext<TicketsContextValue | undefined>(undefined);

export function TicketsProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);

  const advanceStatus = (ticketId: string, nextStatus: TicketStatus) => {
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

export function getNextStatus(current: TicketStatus): TicketStatus | null {
  return STATUS_FLOW[current];
}
