"use client";

import { useState } from "react";
import { Banknote, CreditCard, QrCode, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import type { PaymentMethod } from "@/app/types/cashier";

type PaymentMode = "single" | "split";

type PaymentSplit = {
  id: string;
  method: PaymentMethod;
  amount: number;
};

const METHODS: { id: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "qr", label: "QR Pay", icon: QrCode },
];

interface Props {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  total: number;
  onConfirm: () => void;
}

export default function PaymentPanel({ selected, onSelect, total, onConfirm }: Props) {
  const [mode, setMode] = useState<PaymentMode>("single");
  const [paymentSplits, setPaymentSplits] = useState<PaymentSplit[]>([
    { id: crypto.randomUUID(), method: "cash", amount: 0 },
    { id: crypto.randomUUID(), method: "card", amount: 0 },
  ]);

  const paymentSplitsTotal = paymentSplits.reduce((sum, p) => sum + p.amount, 0);
  const isPaymentBalanced = paymentSplitsTotal === total;
  const paymentDifference = total - paymentSplitsTotal;

  const handlePaymentSplitChange = (id: string, field: "method" | "amount", value: string | number) => {
    setPaymentSplits((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
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

  return (
    <div className="bg-white rounded-2xl border border-black/8 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[14px] font-medium text-text-primary">Payment method</p>
      </div>

      <div className="flex rounded-xl border border-black/10 overflow-hidden mb-4">
        <button
          onClick={() => setMode("single")}
          className={`flex-1 py-2 text-[12px] font-medium ${
            mode === "single" ? "bg-cream-dark text-text-primary" : "text-text-muted"
          }`}
        >
          Single payment
        </button>
        <button
          onClick={() => setMode("split")}
          className={`flex-1 py-2 text-[12px] font-medium ${
            mode === "split" ? "bg-cream-dark text-text-primary" : "text-text-muted"
          }`}
        >
          Split payment
        </button>
      </div>

      {mode === "single" ? (
        <div>
          <div className="flex gap-2 mb-4">
            {METHODS.map((m) => {
              const Icon = m.icon;
              const active = selected === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => onSelect(m.id)}
                  className={`flex-1 flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-colors ${
                    active ? "border-info border-2 bg-info-light text-info" : "border-black/10 text-text-muted"
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span className="text-[11px] font-medium">{m.label}</span>
                </button>
              );
            })}
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onConfirm}
            className="w-full bg-bark text-white rounded-xl py-3 text-[14px] font-medium active:opacity-90 transition-opacity"
          >
            Confirm payment · ฿{total.toLocaleString()}
          </motion.button>
        </div>
      ) : (
        <div>
          <p className="text-[11px] text-text-hint mb-3">
            Split bill total ฿{total.toLocaleString()} across multiple payment methods
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
                        onClick={() => handlePaymentSplitChange(split.id, "method", m.id)}
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
                        Number(e.target.value) || 0
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
              <span className="text-text-muted">Bill total</span>
              <span className="font-medium text-text-primary">฿{total.toLocaleString()}</span>
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
            onClick={onConfirm}
            disabled={!isPaymentBalanced || paymentSplitsTotal === 0}
            className="w-full bg-bark text-white rounded-xl py-3 text-[14px] font-medium active:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm split payment · ฿{total.toLocaleString()}
          </motion.button>
        </div>
      )}
    </div>
  );
}
