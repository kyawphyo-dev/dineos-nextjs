"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import {
  Banknote,
  CreditCard,
  QrCode,
  Plus,
  Trash2,
  X,
  Check,
  Loader2,
  AlertCircle,
  Calculator,
  Wallet,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useCashierSessions,
  calculateBill,
  SERVICE_CHARGE_RATE,
  TAX_RATE,
} from "@/context/CashierSessionContext";
import type {
  PaymentMethod,
  PaymentSplit,
  ReceiptRecord,
  DiningSession,
  Discount,
} from "@/app/types/cashier";

type PaymentMode = "single" | "split";

type InternalPaymentSplit = {
  id: string;
  method: PaymentMethod;
  amount: number;
  receivedAmount?: number;
  referenceNo?: string;
};

const METHODS: { id: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "qr", label: "QR Pay", icon: QrCode },
];

const QUICK_CASH_PRESETS = [100, 200, 500, 1000];

interface Props {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  total: number;
  onConfirm: () => void;
  session: DiningSession;
  discount: Discount | null;
  onPaymentComplete: (receipt: ReceiptRecord) => void;
}

type DemoModalKind = null | "qr" | "card";

type DemoModalState = {
  kind: DemoModalKind;
  pendingSplits: InternalPaymentSplit[];
  targetIndex: number;
  countdown: number;
};

const initialModalState: DemoModalState = {
  kind: null,
  pendingSplits: [],
  targetIndex: 0,
  countdown: 0,
};

function generateRefNo(
  method: PaymentMethod,
  seed: number,
  suffix?: string,
): string | undefined {
  if (method === "cash") return undefined;
  return `DEMO-${seed}-${suffix ?? Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export default function PaymentPanel({
  selected,
  onSelect,
  total,
  onConfirm: _onConfirm,
  session,
  discount,
  onPaymentComplete,
}: Props) {
  const { recordPayment } = useCashierSessions();
  const [mode, setMode] = useState<PaymentMode>("single");
  const [paymentSplits, setPaymentSplits] = useState<InternalPaymentSplit[]>([
    { id: crypto.randomUUID(), method: "cash", amount: 0 },
    { id: crypto.randomUUID(), method: "card", amount: 0 },
  ]);
  const [tenderedAmount, setTenderedAmount] = useState<number>(0);
  const [isSubmitting, startSubmittingTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [modal, setModal] = useState<DemoModalState>(initialModalState);

  const breakdown = useMemo(
    () => calculateBill(session, discount),
    [session, discount],
  );

  const grandTotal = session.billGrandTotal ?? breakdown.grandTotal ?? total;
  const subtotal = session.billSubtotal ?? breakdown.subtotal;
  const discountAmount = session.billDiscount ?? breakdown.discountAmount;
  const serviceCharge = breakdown.serviceCharge;
  const tax = breakdown.tax;

  const paymentSplitsTotal = paymentSplits.reduce(
    (sum, p) => sum + p.amount,
    0,
  );
  const isPaymentBalanced = paymentSplitsTotal === grandTotal;
  const paymentDifference = grandTotal - paymentSplitsTotal;

  const changeDue = Math.max(0, tenderedAmount - grandTotal);
  const tenderedInsufficient =
    tenderedAmount > 0 && tenderedAmount < grandTotal;
  const tenderedIsValid = tenderedAmount >= grandTotal;

  useEffect(() => {
    if ((modal.kind === "qr" || modal.kind === "card") && modal.countdown > 0) {
      const timer = setTimeout(() => {
        setModal((prev) => ({
          ...prev,
          countdown: Math.max(0, prev.countdown - 1),
        }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [modal.kind, modal.countdown]);

  const handlePaymentSplitChange = (
    id: string,
    field: "method" | "amount",
    value: string | number,
  ) => {
    setPaymentSplits((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  const handleAddPaymentSplit = () => {
    setPaymentSplits((prev) => [
      ...prev,
      { id: crypto.randomUUID(), method: "cash", amount: 0 },
    ]);
  };

  const handleRemovePaymentSplit = (id: string) => {
    if (paymentSplits.length <= 1) return;
    setPaymentSplits((prev) => prev.filter((p) => p.id !== id));
  };

  const getEffectiveSplits = (): InternalPaymentSplit[] => {
    if (mode === "single") {
      const seed = Date.now();
      const ref = generateRefNo(selected, seed);
      const received =
        selected === "cash" && tenderedAmount > 0 ? tenderedAmount : grandTotal;
      return [
        {
          id: crypto.randomUUID(),
          method: selected,
          amount: grandTotal,
          receivedAmount: received,
          referenceNo: ref,
        },
      ];
    }
    return paymentSplits
      .filter((s) => s.amount > 0)
      .map((s, idx) => ({
        ...s,
        receivedAmount: s.receivedAmount ?? s.amount,
        referenceNo:
          s.referenceNo ?? generateRefNo(s.method, Date.now(), String(idx + 1)),
      }));
  };

  const findNextDemoIndex = (splits: InternalPaymentSplit[]): number => {
    for (let i = 0; i < splits.length; i++) {
      const m = splits[i].method;
      if (m === "qr" || m === "card") return i;
    }
    return -1;
  };

  const submitPayment = (finalSplits: InternalPaymentSplit[]) => {
    setErrorMsg(null);
    startSubmittingTransition(async () => {
      try {
        const payments: PaymentSplit[] = finalSplits.map((s) => ({
          method: s.method,
          amount: s.amount,
          receivedAmount: s.receivedAmount,
          referenceNo: s.referenceNo,
        }));

        const receipt = await recordPayment(
          session.tableId,
          discount,
          payments,
        );
        onPaymentComplete(receipt);
      } catch (e) {
        setErrorMsg(
          e instanceof Error ? e.message : "Failed to record payment",
        );
      }
    });
  };

  const advanceThroughDemoFlowIfNeeded = (splits: InternalPaymentSplit[]) => {
    const nextIdx = findNextDemoIndex(splits);
    if (nextIdx === -1) {
      submitPayment(splits);
      return;
    }
    const next = splits[nextIdx];
    setModal({
      kind: next.method === "qr" ? "qr" : "card",
      pendingSplits: splits,
      targetIndex: nextIdx,
      countdown: next.method === "qr" ? 3 : 2,
    });
  };

  const handleDemoApprove = () => {
    const { pendingSplits, targetIndex } = modal;
    const remaining = pendingSplits.slice();
    const nextIdx = findNextDemoIndex(
      remaining.map((s, i) =>
        i <= targetIndex ? { ...s, method: "cash" as PaymentMethod } : s,
      ),
    );
    if (nextIdx === -1 || nextIdx <= targetIndex) {
      setModal(initialModalState);
      submitPayment(pendingSplits);
      return;
    }
    const nextSplit = pendingSplits[nextIdx];
    setModal({
      kind: nextSplit.method === "qr" ? "qr" : "card",
      pendingSplits,
      targetIndex: nextIdx,
      countdown: nextSplit.method === "qr" ? 3 : 2,
    });
  };

  const handleDemoCancel = () => {
    setModal(initialModalState);
  };

  const handleConfirmSingle = () => {
    if (grandTotal === 0) return;
    if (selected === "cash" && !tenderedIsValid) {
      setErrorMsg("Tendered amount must be at least the grand total.");
      return;
    }
    const splits = getEffectiveSplits();
    advanceThroughDemoFlowIfNeeded(splits);
  };

  const handleConfirmSplit = () => {
    if (!isPaymentBalanced || paymentSplitsTotal === 0) return;
    const splits = getEffectiveSplits();
    if (splits.length === 0) {
      setErrorMsg("No splits with amounts found");
      return;
    }
    advanceThroughDemoFlowIfNeeded(splits);
  };

  const pendingSplit =
    modal.kind && modal.pendingSplits[modal.targetIndex]
      ? modal.pendingSplits[modal.targetIndex]
      : null;

  return (
    <>
      <div className="bg-white rounded-2xl border border-black/8 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[14px] font-medium text-text-primary">
            Payment method
          </p>
        </div>

        <div className="flex rounded-xl border border-black/10 overflow-hidden mb-4">
          <button
            onClick={() => setMode("single")}
            className={`flex-1 py-2 text-[12px] font-medium ${
              mode === "single"
                ? "bg-cream-dark text-text-primary"
                : "text-text-muted"
            }`}
          >
            Single payment
          </button>
          <button
            onClick={() => setMode("split")}
            className={`flex-1 py-2 text-[12px] font-medium ${
              mode === "split"
                ? "bg-cream-dark text-text-primary"
                : "text-text-muted"
            }`}
          >
            Split payment
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-[12px] text-rose-600 mb-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {mode === "single" ? (
          <div>
            <div className="rounded-xl border border-black/8 p-3 space-y-1.5 mb-4 bg-cream-dark/40">
              <div className="flex justify-between text-[12px]">
                <span className="text-text-muted">Subtotal</span>
                <span className="font-medium text-text-primary">
                  ฿{subtotal.toLocaleString()}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[12px] text-rose">
                  <span>Discount</span>
                  <span>−฿{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-[12px]">
                <span className="text-text-muted">
                  Service charge ({SERVICE_CHARGE_RATE}%)
                </span>
                <span className="font-medium text-text-primary">
                  ฿{serviceCharge.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-text-muted">VAT ({TAX_RATE}%)</span>
                <span className="font-medium text-text-primary">
                  ฿{tax.toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-black/8" />
              <div className="flex justify-between text-[14px]">
                <span className="text-text-muted font-semibold">
                  Grand total
                </span>
                <span className="font-bold text-text-primary">
                  ฿{grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              {METHODS.map((m) => {
                const Icon = m.icon;
                const active = selected === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => onSelect(m.id)}
                    className={`flex-1 flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-colors ${
                      active
                        ? "border-info border-2 bg-info-light text-info"
                        : "border-black/10 text-text-muted"
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    <span className="text-[11px] font-medium">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {selected === "cash" && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="rounded-xl border border-clay/30 bg-clay/5 p-4 overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="w-4 h-4 text-clay" />
                  <p className="text-[13px] font-medium text-text-primary">
                    Cash tendered
                  </p>
                </div>

                <div className="flex items-center mb-3 bg-white rounded-md border border-black/10 pl-3 pr-2 py-2">
                  <span className="text-[14px] text-text-hint mr-1.5">฿</span>
                  <input
                    type="number"
                    min={0}
                    value={tenderedAmount || ""}
                    onChange={(e) =>
                      setTenderedAmount(Number(e.target.value) || 0)
                    }
                    onFocus={() =>
                      setTenderedAmount((v) => (v === 0 ? grandTotal : v))
                    }
                    placeholder="Enter amount received"
                    className="w-full text-[14px] font-medium text-text-primary outline-none bg-transparent placeholder:text-text-hint"
                  />
                  <button
                    onClick={() => setTenderedAmount(grandTotal)}
                    className="text-[11px] text-clay font-medium px-2 py-1 rounded-md hover:bg-clay/10 transition-colors flex-shrink-0"
                  >
                    Exact
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {QUICK_CASH_PRESETS.map((preset) => {
                    const withPreset = grandTotal + preset;
                    const rounded = Math.ceil(grandTotal / preset) * preset;
                    return (
                      <button
                        key={preset}
                        onClick={() => setTenderedAmount(rounded)}
                        className="rounded-md bg-white border border-black/10 py-1.5 text-[11px] font-medium text-text-muted hover:text-clay hover:border-clay/40 transition-colors"
                      >
                        ฿{preset.toLocaleString()}
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-lg bg-white border border-black/8 p-3 space-y-1.5">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-text-muted">Grand total</span>
                    <span className="font-medium text-text-primary">
                      ฿{grandTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-text-muted flex items-center gap-1">
                      <Wallet className="w-3 h-3" />
                      Tendered
                    </span>
                    <span
                      className={`font-medium ${
                        tenderedInsufficient
                          ? "text-rose-500"
                          : "text-text-primary"
                      }`}
                    >
                      ฿{tenderedAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-px bg-black/8" />
                  <div className="flex justify-between text-[13px]">
                    <span className="text-text-muted font-semibold">
                      Change due
                    </span>
                    <span
                      className={`font-bold ${
                        changeDue > 0
                          ? "text-success"
                          : tenderedAmount === 0
                            ? "text-text-hint"
                            : "text-text-primary"
                      }`}
                    >
                      {tenderedAmount === 0
                        ? "—"
                        : changeDue > 0
                          ? `+฿${changeDue.toLocaleString()}`
                          : tenderedInsufficient
                            ? `Short ฿${Math.abs(changeDue - grandTotal + tenderedAmount).toLocaleString()}`
                            : "฿0"}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirmSingle}
              disabled={
                isSubmitting ||
                grandTotal === 0 ||
                (selected === "cash" && tenderedAmount > 0 && !tenderedIsValid)
              }
              className="w-full bg-bark text-white rounded-xl py-3 text-[14px] font-medium active:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Recording payment…
                </>
              ) : (
                <>Confirm payment · ฿{grandTotal.toLocaleString()}</>
              )}
            </motion.button>
          </div>
        ) : (
          <div>
            <p className="text-[11px] text-text-hint mb-3">
              Split bill grand total ฿{grandTotal.toLocaleString()} across
              multiple payment methods
            </p>

            <div className="flex flex-col gap-2 mb-3">
              {paymentSplits.map((split, index) => (
                <div
                  key={split.id}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-black/8 bg-cream-dark/40"
                >
                  <span className="text-[11px] text-text-muted font-medium w-5 flex-shrink-0">
                    {index + 1}.
                  </span>

                  <div className="flex gap-1 flex-shrink-0">
                    {METHODS.map((m) => {
                      const MIcon = m.icon;
                      const active = split.method === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() =>
                            handlePaymentSplitChange(split.id, "method", m.id)
                          }
                          className={`w-7 h-7 rounded-md flex items-center justify-center border transition-colors ${
                            active
                              ? "bg-info border-info text-white"
                              : "border-black/10 text-text-hint bg-white"
                          }`}
                          title={m.label}
                        >
                          <MIcon className="w-3.5 h-3.5" />
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center flex-1 bg-white rounded-md border border-black/10 pl-2.5 pr-1 py-1">
                    <span className="text-[13px] text-text-hint mr-1">฿</span>
                    <input
                      type="number"
                      min={0}
                      value={split.amount || ""}
                      onChange={(e) =>
                        handlePaymentSplitChange(
                          split.id,
                          "amount",
                          Number(e.target.value) || 0,
                        )
                      }
                      placeholder="0"
                      className="w-full text-[13px] font-medium text-text-primary outline-none bg-transparent placeholder:text-text-hint"
                    />
                  </div>

                  <button
                    onClick={() => handleRemovePaymentSplit(split.id)}
                    disabled={paymentSplits.length <= 1}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-text-hint hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddPaymentSplit}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-black/12 text-[12px] font-medium text-text-muted mb-3 hover:border-clay hover:text-clay transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add payment method
            </button>

            <div className="rounded-xl border border-black/8 p-3 space-y-2 mb-4">
              <div className="flex justify-between text-[12px]">
                <span className="text-text-muted">Grand total</span>
                <span className="font-medium text-text-primary">
                  ฿{grandTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-text-muted">Allocated</span>
                <span
                  className={`font-medium ${
                    isPaymentBalanced ? "text-success" : "text-text-primary"
                  }`}
                >
                  ฿{paymentSplitsTotal.toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-black/8" />
              <div className="flex justify-between text-[13px]">
                <span className="text-text-muted font-medium">
                  {paymentDifference > 0
                    ? "Remaining"
                    : paymentDifference < 0
                      ? "Overpaid"
                      : "Status"}
                </span>
                <span
                  className={`font-semibold ${
                    isPaymentBalanced
                      ? "text-success"
                      : paymentDifference < 0
                        ? "text-red-500"
                        : "text-clay"
                  }`}
                >
                  {isPaymentBalanced
                    ? "✓ Balanced"
                    : `฿${Math.abs(paymentDifference).toLocaleString()}`}
                </span>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirmSplit}
              disabled={
                !isPaymentBalanced || paymentSplitsTotal === 0 || isSubmitting
              }
              className="w-full bg-bark text-white rounded-xl py-3 text-[14px] font-medium active:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Recording payment…
                </>
              ) : (
                <>Confirm split payment · ฿{grandTotal.toLocaleString()}</>
              )}
            </motion.button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal.kind === "qr" && pendingSplit && (
          <>
            <motion.div
              key="qr-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={handleDemoCancel}
            />
            <motion.div
              key="qr-panel"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm z-[51] bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="relative p-6">
                <button
                  onClick={handleDemoCancel}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-cream-dark hover:bg-black/10 text-text-muted"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-info-light flex items-center justify-center">
                    <QrCode className="w-4.5 h-4.5 text-info" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-text-primary">
                      QR Payment (Demo)
                    </h3>
                    <p className="text-[11px] text-text-hint">
                      Scan to simulate payment
                    </p>
                  </div>
                </div>

                <div className="bg-cream-dark/40 rounded-2xl p-5 mb-4 flex flex-col items-center">
                  <div className="w-[180px] h-[180px] bg-white rounded-xl border border-black/8 p-3 mb-3 flex items-center justify-center">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="100" height="100" fill="white" />
                      {Array.from({ length: 21 * 21 }).map((_, i) => {
                        const x = i % 21;
                        const y = Math.floor(i / 21);
                        const seed = (x * 7 + y * 13 + i) % 5;
                        const isFinder =
                          (x < 7 && y < 7) ||
                          (x > 13 && y < 7) ||
                          (x < 7 && y > 13);
                        if (isFinder) return null;
                        if (seed === 0) {
                          return (
                            <rect
                              key={i}
                              x={x * 4.76}
                              y={y * 4.76}
                              width="4.76"
                              height="4.76"
                              fill="#1b1b1b"
                            />
                          );
                        }
                        return null;
                      })}
                      <rect
                        x="2"
                        y="2"
                        width="28"
                        height="28"
                        fill="none"
                        stroke="#1b1b1b"
                        strokeWidth="4"
                      />
                      <rect x="6" y="6" width="20" height="20" fill="#1b1b1b" />
                      <rect
                        x="70"
                        y="2"
                        width="28"
                        height="28"
                        fill="none"
                        stroke="#1b1b1b"
                        strokeWidth="4"
                      />
                      <rect
                        x="74"
                        y="6"
                        width="20"
                        height="20"
                        fill="#1b1b1b"
                      />
                      <rect
                        x="2"
                        y="70"
                        width="28"
                        height="28"
                        fill="none"
                        stroke="#1b1b1b"
                        strokeWidth="4"
                      />
                      <rect
                        x="6"
                        y="74"
                        width="20"
                        height="20"
                        fill="#1b1b1b"
                      />
                    </svg>
                  </div>
                  <p className="text-[18px] font-bold text-text-primary mb-0.5">
                    ฿{pendingSplit.amount.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-text-hint">
                    Table {session.tableId} · {session.packageName}
                  </p>
                  {pendingSplit.referenceNo && (
                    <p className="text-[10px] text-text-hint mt-2 font-mono">
                      Ref: {pendingSplit.referenceNo}
                    </p>
                  )}
                </div>

                {modal.countdown > 0 ? (
                  <div className="flex flex-col items-center gap-1.5 mb-4">
                    <Loader2 className="w-5 h-5 text-info animate-spin" />
                    <p className="text-[12px] text-text-hint">
                      Waiting for scan… (auto-approves in {modal.countdown}s)
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 mb-4 text-[12px] text-success">
                    <Check className="w-4 h-4" />
                    Scan detected — demo approval ready
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleDemoCancel}
                    className="flex-1 rounded-xl border border-black/10 text-text-muted py-2.5 text-[13px] font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDemoApprove}
                    disabled={modal.countdown > 0 || isSubmitting}
                    className="flex-1 rounded-xl bg-bark text-white py-2.5 text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Confirm received
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {modal.kind === "card" && pendingSplit && (
          <>
            <motion.div
              key="card-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={handleDemoCancel}
            />
            <motion.div
              key="card-panel"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm z-[51] bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="relative p-6">
                <button
                  onClick={handleDemoCancel}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-cream-dark hover:bg-black/10 text-text-muted"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-info-light flex items-center justify-center">
                    <CreditCard className="w-4.5 h-4.5 text-info" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-text-primary">
                      Card Payment (Demo)
                    </h3>
                    <p className="text-[11px] text-text-hint">
                      Simulate chip + PIN terminal
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-bark/90 to-bark p-5 text-white mb-5 shadow-lg">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] uppercase tracking-widest opacity-70">
                      Demo Bank
                    </span>
                    <CreditCard className="w-6 h-6 opacity-80" />
                  </div>
                  <p className="text-[18px] tracking-[0.2em] font-mono mb-3">
                    •••• •••• •••• 4242
                  </p>
                  <div className="flex justify-between text-[11px]">
                    <div>
                      <p className="opacity-70 uppercase text-[9px]">
                        Cardholder
                      </p>
                      <p className="font-medium">DINEOS DEMO</p>
                    </div>
                    <div>
                      <p className="opacity-70 uppercase text-[9px]">Exp</p>
                      <p className="font-medium">12/30</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-black/8 p-4 mb-4 bg-cream-dark/40">
                  <div className="flex justify-between text-[12px] mb-2">
                    <span className="text-text-muted">Amount</span>
                    <span className="font-bold text-text-primary">
                      ฿{pendingSplit.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[12px] mb-2">
                    <span className="text-text-muted">Terminal</span>
                    <span className="font-medium text-text-primary">
                      DEMO-POS-01
                    </span>
                  </div>
                  {pendingSplit.referenceNo && (
                    <div className="flex justify-between text-[12px] mb-2">
                      <span className="text-text-muted">Auth ID</span>
                      <span className="font-mono font-medium text-info">
                        {pendingSplit.referenceNo}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-[12px]">
                    <span className="text-text-muted">Status</span>
                    <span className="font-medium text-info">
                      {modal.countdown > 0
                        ? "Processing card terminal…"
                        : "Ready to approve"}
                    </span>
                  </div>
                </div>

                {modal.countdown > 0 ? (
                  <div className="flex flex-col items-center gap-1.5 mb-4 pt-2">
                    <Loader2 className="w-6 h-6 text-info animate-spin" />
                    <p className="text-[12px] text-text-hint">
                      Reading chip + PIN… (auto-unlocks in {modal.countdown}s)
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 mb-4 pt-2 text-[12px] text-success">
                    <Check className="w-4 h-4" />
                    Chip verified — approval ready
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleDemoCancel}
                    className="flex-1 rounded-xl border border-slate-200 text-slate-600 py-3 text-[14px] font-semibold hover:bg-slate-50 active:scale-[0.98] transition"
                  >
                    Decline
                  </button>
                  <button
                    onClick={handleDemoApprove}
                    disabled={modal.countdown > 0 || isSubmitting}
                    className="flex-1 rounded-xl bg-emerald-600 text-white py-3 text-[14px] font-bold shadow-md shadow-emerald-600/25 hover:bg-emerald-700 active:scale-[0.98] transition disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:opacity-80 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? "Sending…"
                      : modal.countdown > 0
                        ? `Wait ${modal.countdown}s…`
                        : "✓ Approve payment"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
