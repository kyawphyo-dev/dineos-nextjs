"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { INITIAL_SESSIONS, INITIAL_RECEIPTS } from "@/app/data/cashier-mock";
import type { DiningSession, Discount, PaymentMethod, ReceiptRecord } from "@/app/types/cashier";

interface SessionsContextValue {
  sessions: DiningSession[];
  receipts: ReceiptRecord[];
  getSession: (tableId: string) => DiningSession | undefined;
  getReceipt: (id: string) => ReceiptRecord | undefined;
  markFinishedEating: (tableId: string) => void;
  recordPayment: (tableId: string, discount: Discount | null, method: PaymentMethod) => ReceiptRecord;
  closeSession: (tableId: string) => void;
}

const SessionsContext = createContext<SessionsContextValue | undefined>(undefined);

let receiptCounter = 5001;

export function SessionsProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<DiningSession[]>(INITIAL_SESSIONS);
  const [receipts, setReceipts] = useState<ReceiptRecord[]>(INITIAL_RECEIPTS);

  const getSession = (tableId: string) => sessions.find((s) => s.tableId === tableId);
  const getReceipt = (id: string) => receipts.find((r) => r.id === id);

  const markFinishedEating = (tableId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.tableId === tableId ? { ...s, status: "finished" } : s))
    );
  };

  const recordPayment = (tableId: string, discount: Discount | null, method: PaymentMethod) => {
    const session = sessions.find((s) => s.tableId === tableId);
    if (!session) throw new Error(`No session found for table ${tableId}`);

    const { subtotal, discountAmount, total } = calculateBill(session, discount);
    const now = new Date();

    const receipt: ReceiptRecord = {
      id: String(receiptCounter++),
      tableId: session.tableId,
      packageName: session.packageName,
      guestCount: session.guestCount,
      orderIds: session.orderIds,
      items: session.items,
      subtotal,
      discount,
      discountAmount,
      total,
      method,
      paidAt: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      paidDate: now.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }),
      paidDateISO: toLocalISODate(now),
    };

    setSessions((prev) => prev.map((s) => (s.tableId === tableId ? { ...s, status: "billed" } : s)));
    setReceipts((prev) => [...prev, receipt]);
    return receipt;
  };

  const closeSession = (tableId: string) => {
    setSessions((prev) => prev.filter((s) => s.tableId !== tableId));
  };

  return (
    <SessionsContext.Provider
      value={{ sessions, receipts, getSession, getReceipt, markFinishedEating, recordPayment, closeSession }}
    >
      {children}
    </SessionsContext.Provider>
  );
}

export function useSessions() {
  const ctx = useContext(SessionsContext);
  if (!ctx) throw new Error("useSessions must be used within a SessionsProvider");
  return ctx;
}

export function calculateBill(session: DiningSession, discount: Discount | null) {
  const subtotal = session.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  let discountAmount = 0;
  if (discount) {
    discountAmount =
      discount.type === "percent" ? Math.round(subtotal * (discount.value / 100)) : discount.value;
  }
  const total = Math.max(0, subtotal - discountAmount);
  return { subtotal, discountAmount, total };
}

/**
 * Formats a Date as a local "YYYY-MM-DD" string (not UTC), so the date
 * matches what the cashier sees on their wall clock — important since
 * Date.toISOString() shifts to UTC and can roll over to the wrong day.
 */
export function toLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
