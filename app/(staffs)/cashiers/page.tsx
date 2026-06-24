"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Users, History } from "lucide-react";
import SessionRow from "./components/SessionRow";
import BillSummary from "./components/BillSummary";
import DiscountControls from "./components/DiscountControls";
import SplitBillPanel from "./components/SplitBillPanel";
import PaymentPanel from "./components/PaymentPanel";
import ReceiptConfirmation from "./components/ReceiptConfirmation";
import { useSessions, calculateBill } from "@/context/SessionsContext";
import type { Discount, PaymentMethod, ReceiptRecord } from "./types";

export default function CashierDashboard() {
  const router = useRouter();
  const { sessions, getSession, recordPayment, closeSession, markFinishedEating } = useSessions();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [showSplit, setShowSplit] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [paidReceipt, setPaidReceipt] = useState<ReceiptRecord | null>(null);

  const selectedSession = selectedTableId ? getSession(selectedTableId) : undefined;

  const handleSelect = (tableId: string) => {
    setSelectedTableId(tableId);
    setDiscount(null);
    setShowSplit(false);
    setPaidReceipt(null);
    setMethod("cash");
  };

  const handleConfirmPayment = () => {
    if (!selectedSession) return;
    const receipt = recordPayment(selectedSession.tableId, discount, method);
    setPaidReceipt(receipt);
  };

  const handleCloseSession = () => {
    if (!selectedTableId) return;
    closeSession(selectedTableId);
    setSelectedTableId(null);
    setPaidReceipt(null);
  };

  const billTotal = selectedSession ? calculateBill(selectedSession, discount).total : 0;

  return (
    <div className="min-h-screen bg-cream-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-bark flex items-center justify-center flex-shrink-0">
              <Wallet className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-[18px] font-medium text-text-primary">Cashier</h1>
              <p className="text-[12px] text-text-muted mt-0.5">Baan Rim Naam · {sessions.length} active sessions</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/history")}
            className="flex items-center gap-1.5 text-[12px] font-medium text-text-muted bg-white border border-black/8 rounded-xl px-3.5 py-2"
          >
            <History className="w-3.5 h-3.5" />
            Bill history
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 mt-6">
          {/* Active sessions list */}
          <div>
            <p className="text-[12px] font-medium text-text-hint uppercase tracking-wider mb-3">
              Active dining sessions
            </p>
            <div className="flex flex-col gap-2">
              {sessions.map((session) => (
                <SessionRow
                  key={session.tableId}
                  session={session}
                  selected={selectedTableId === session.tableId}
                  onClick={() => handleSelect(session.tableId)}
                  onMarkFinished={() => markFinishedEating(session.tableId)}
                />
              ))}
              {sessions.length === 0 && (
                <div className="flex items-center justify-center gap-2 text-text-hint text-[13px] py-12">
                  <Users className="w-4 h-4" />
                  No active sessions right now
                </div>
              )}
            </div>
          </div>

          {/* Billing panel */}
          {selectedSession && (
            <div className="flex flex-col gap-4">
              {paidReceipt ? (
                <ReceiptConfirmation receipt={paidReceipt} onClose={handleCloseSession} />
              ) : (
                <>
                  <BillSummary session={selectedSession} discount={discount} />
                  <DiscountControls discount={discount} onChange={setDiscount} />

                  {!showSplit ? (
                    <button
                      onClick={() => setShowSplit(true)}
                      className="w-full border border-black/12 text-text-muted rounded-xl py-2.5 text-[13px] font-medium flex items-center justify-center gap-1.5 bg-white"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Split bill between guests
                    </button>
                  ) : (
                    <SplitBillPanel
                      session={selectedSession}
                      total={billTotal}
                      onClose={() => setShowSplit(false)}
                    />
                  )}

                  <PaymentPanel
                    selected={method}
                    onSelect={setMethod}
                    total={billTotal}
                    onConfirm={handleConfirmPayment}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
