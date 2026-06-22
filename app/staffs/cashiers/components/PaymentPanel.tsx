"use client";

import { Banknote, CreditCard, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import type { PaymentMethod } from "../types";

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
  return (
    <div className="bg-white rounded-2xl border border-black/8 p-5">
      <p className="text-[14px] font-medium text-text-primary mb-3">Payment method</p>

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
  );
}
