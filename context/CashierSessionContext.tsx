"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import type {
  DiningSession,
  Discount,
  PaymentMethod,
  ReceiptRecord,
  PaymentSplit,
} from "@/app/types/cashier";
import type { CashierSessionResult } from "@/lib/actions/Cashier/GetCashierSession.action";
import MarkFinishedEating from "@/lib/actions/Cashier/MarkFinishedEating.action";
import CreateBill from "@/lib/actions/Cashier/CreateBill.action";
import RecordPayment from "@/lib/actions/Cashier/RecordPayment.action";

interface CashierSessionsContextValue extends CashierSessionResult {
  sessions: DiningSession[];
  receipts: ReceiptRecord[];
  getSession: (tableId: string) => DiningSession | undefined;
  getReceipt: (id: string) => ReceiptRecord | undefined;
  markFinishedEating: (tableId: string) => Promise<void>;
  createBill: (tableId: string, discount: Discount | null) => Promise<void>;
  recordPayment: (
    tableId: string,
    discount: Discount | null,
    payments: PaymentSplit[],
  ) => Promise<ReceiptRecord>;
  closeSession: (tableId: string) => void;
}

const CashierSessionsContext = createContext<
  CashierSessionsContextValue | undefined
>(undefined);

export default function CashierSessionProvider({
  value,
  initialReceipts = [],
  children,
}: {
  value: CashierSessionResult;
  initialReceipts?: ReceiptRecord[];
  children: ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sessions, setSessions] = useState<DiningSession[]>(value.sessions);
  const [sessionsPropSnapshot, setSessionsPropSnapshot] = useState(
    value.sessions,
  );
  const [receipts, setReceipts] = useState<ReceiptRecord[]>(initialReceipts);

  if (value.sessions !== sessionsPropSnapshot) {
    setSessions((prevLocal) => {
      const incomingIds = new Set(value.sessions.map((s) => s.tableId));
      const localBilledStale = prevLocal.filter(
        (localSession) =>
          localSession.status === "billed" &&
          !incomingIds.has(localSession.tableId),
      );
      return [...value.sessions, ...localBilledStale];
    });
    setSessionsPropSnapshot(value.sessions);
  }

  const getSession = (tableId: string) =>
    sessions.find((s) => s.tableId === tableId);
  const getReceipt = (id: string) => receipts.find((r) => r.id === id);

  const markFinishedEating = async (tableId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.tableId === tableId ? { ...s, status: "finished" } : s,
      ),
    );

    const result = await MarkFinishedEating({
      tableNumber: tableId,
      branchId: value.branch.id,
    });

    if (!result.success) {
      setSessions((prev) =>
        prev.map((s) =>
          s.tableId === tableId ? { ...s, status: "dining" } : s,
        ),
      );
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  };

  const createBill = async (tableId: string, discount: Discount | null) => {
    const session = sessions.find((s) => s.tableId === tableId);
    if (!session) throw new Error(`No session found for table ${tableId}`);

    const { subtotal, discountAmount } = calculateBill(session, discount);

    const result = await CreateBill({
      tableNumber: tableId,
      branchId: value.branch.id,
      subtotal,
      discount: discountAmount,
    });

    if (!result.success) {
      throw new Error(result.message ?? "Failed to create bill");
    }

    if (result.data) {
      const bill = result.data;
      setSessions((prev) =>
        prev.map((s) =>
          s.tableId === tableId
            ? {
                ...s,
                billId: bill.id,
                billReceiptNumber: bill.receiptNumber,
                billStatus: bill.status,
                billSubtotal: bill.subtotal,
                billDiscount: bill.discount,
                billGrandTotal: bill.grandTotal,
              }
            : s,
        ),
      );
    }

    startTransition(() => {
      router.refresh();
    });
  };

  const recordPayment = async (
    tableId: string,
    discount: Discount | null,
    payments: PaymentSplit[],
  ): Promise<ReceiptRecord> => {
    const session = sessions.find((s) => s.tableId === tableId);
    if (!session) throw new Error(`No session found for table ${tableId}`);
    if (!payments || payments.length === 0) {
      throw new Error("At least one payment is required");
    }

    const prevStatus = session.status;
    setSessions((prev) =>
      prev.map((s) => (s.tableId === tableId ? { ...s, status: "billed" } : s)),
    );

    try {
      const result = await RecordPayment({
        tableNumber: tableId,
        branchId: value.branch.id,
        payments: payments.map((p) => ({
          method: p.method,
          amount: p.amount,
          referenceNo: p.referenceNo,
        })),
      });

      if (!result.success || !result.data?.receipt) {
        throw new Error(result.message ?? "Failed to record payment");
      }

      const receipt = result.data.receipt;
      setReceipts((prev) => [...prev, receipt]);

      startTransition(() => {
        router.refresh();
      });

      return receipt;
    } catch (e) {
      setSessions((prev) =>
        prev.map((s) =>
          s.tableId === tableId ? { ...s, status: prevStatus } : s,
        ),
      );
      throw e;
    }
  };

  const closeSession = (tableId: string) => {
    setSessions((prev) => prev.filter((s) => s.tableId !== tableId));
  };

  return (
    <CashierSessionsContext.Provider
      value={{
        restaurant: value.restaurant,
        branch: value.branch,
        sessions,
        receipts,
        getSession,
        getReceipt,
        markFinishedEating,
        createBill,
        recordPayment,
        closeSession,
      }}
    >
      {children}
    </CashierSessionsContext.Provider>
  );
}

export function useCashierSessions() {
  const ctx = useContext(CashierSessionsContext);
  if (!ctx)
    throw new Error(
      "useCashierSessions must be used within a CashierSessionProvider",
    );
  return ctx;
}

export function useSessions() {
  return useCashierSessions();
}

export const SERVICE_CHARGE_RATE = 5;
export const TAX_RATE = 7;

export function calculateBill(
  session: DiningSession,
  discount: Discount | null,
) {
  const subtotal = session.items.reduce(
    (sum, item) => sum + item.qty * item.price,
    0,
  );
  let discountAmount = 0;
  if (discount) {
    discountAmount =
      discount.type === "percent"
        ? Math.round(subtotal * (discount.value / 100))
        : discount.value;
  }
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const serviceCharge = Math.round(afterDiscount * (SERVICE_CHARGE_RATE / 100));
  const afterService = afterDiscount + serviceCharge;
  const tax = Math.round(afterService * (TAX_RATE / 100));
  const grandTotal = afterService + tax;
  return { subtotal, discountAmount, serviceCharge, tax, grandTotal };
}

export function toLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
