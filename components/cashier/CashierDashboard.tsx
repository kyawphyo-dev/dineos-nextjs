"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Users, History } from "lucide-react";
import UserMenu from "@/components/shared/UserMenu";
import SessionRow from "@/components/cashier/SessionRow";
import BillSummary from "@/components/cashier/BillSummary";
import DiscountControls from "@/components/cashier/DiscountControls";
import SplitBillPanel from "@/components/cashier/SplitBillPanel";
import PaymentPanel from "@/components/cashier/PaymentPanel";
import ReceiptConfirmation from "@/components/cashier/ReceiptConfirmation";
import {
  useCashierSessions,
  calculateBill,
} from "@/context/CashierSessionContext";
import type {
  Discount,
  PaymentMethod,
  ReceiptRecord,
} from "@/app/types/cashier";

export default function CashierDashboard() {
  const router = useRouter();
  const {
    sessions,
    restaurant,
    branch,
    getSession,
    markFinishedEating,
    createBill,
    recordPayment,
    closeSession,
  } = useCashierSessions();
  const [isCreatingBill, startCreateBillTransition] = useTransition();
  const [createBillError, setCreateBillError] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [showSplit, setShowSplit] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [paidReceipt, setPaidReceipt] = useState<ReceiptRecord | null>(null);
  const [billCreated, setBillCreated] = useState(false);

  const selectedSession = selectedTableId
    ? getSession(selectedTableId)
    : undefined;

  const handleSelect = (tableId: string) => {
    setSelectedTableId(tableId);
    setDiscount(null);
    setShowSplit(false);
    setPaidReceipt(null);
    setMethod("cash");
    setBillCreated(false);
    setCreateBillError(null);
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
    setBillCreated(false);
  };

  const handleCreateBill = async () => {
    if (!selectedSession) return;
    setCreateBillError(null);

    startCreateBillTransition(async () => {
      try {
        await createBill(selectedSession.tableId, discount);
        setBillCreated(true);
      } catch (e) {
        setBillCreated(false);
        setCreateBillError(
          e instanceof Error ? e.message : "Failed to create bill",
        );
      }
    });
  };

  const handleMarkFinishedEating = async (tableId: string) => {
    await markFinishedEating(tableId);
  };

  const billTotal = selectedSession
    ? calculateBill(selectedSession, discount).total
    : 0;

  return (
    <div className="min-h-screen bg-cream-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-bark flex items-center justify-center shrink-0">
              <Wallet className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-[18px] font-medium text-text-primary">
                Cashier
              </h1>
              <p className="text-[12px] text-text-muted mt-0.5">
                {restaurant.name}
                {branch.name ? ` · ${branch.name}` : ""}
                {" · "}
                {sessions.length} active sessions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/cashier/history")}
              className="flex items-center gap-1.5 text-[12px] font-medium text-text-muted bg-white border border-black/8 rounded-xl px-3.5 py-2"
            >
              <History className="w-3.5 h-3.5" />
              Bill history
            </button>
            <UserMenu />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 mt-6">
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
                  onMarkFinished={() =>
                    handleMarkFinishedEating(session.tableId)
                  }
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

          {selectedSession && (
            <div className="flex flex-col gap-4">
              {paidReceipt ? (
                <ReceiptConfirmation
                  receipt={paidReceipt}
                  onClose={handleCloseSession}
                />
              ) : !billCreated ? (
                <>
                  <BillSummary session={selectedSession} discount={discount} />
                  <DiscountControls
                    discount={discount}
                    onChange={setDiscount}
                  />

                  {createBillError && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-[12px] text-rose-600">
                      {createBillError}
                    </div>
                  )}

                  <button
                    onClick={handleCreateBill}
                    disabled={isCreatingBill}
                    className="w-full bg-bark text-white rounded-xl py-3 text-[14px] font-medium active:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingBill ? (
                      <>
                        <svg
                          className="w-4 h-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Creating bill…
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Create bill
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <BillSummary session={selectedSession} discount={discount} />

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
