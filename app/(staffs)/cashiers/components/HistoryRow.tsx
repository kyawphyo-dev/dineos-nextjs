"use client";

import { motion } from "framer-motion";
import { Banknote, CreditCard, QrCode } from "lucide-react";
import type { ReceiptRecord } from "../types";

const METHOD_ICON: Record<ReceiptRecord["method"], typeof Banknote> = {
  cash: Banknote,
  card: CreditCard,
  qr: QrCode,
};

interface Props {
  receipt: ReceiptRecord;
  onClick: () => void;
}

export default function HistoryRow({ receipt, onClick }: Props) {
  const Icon = METHOD_ICON[receipt.method];

  return (
    <motion.button
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-white rounded-2xl border border-black/8 p-3.5 text-left"
    >
      <div className="w-9 h-9 rounded-lg bg-cream-dark flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-text-muted" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-text-primary">
          Table {receipt.tableId} <span className="text-text-hint font-normal">· #{receipt.id}</span>
        </p>
        <p className="text-[11px] text-text-hint mt-0.5">
          {receipt.paidDate} · {receipt.paidAt}
        </p>
      </div>
      <p className="text-[14px] font-medium text-text-primary flex-shrink-0">
        ฿{receipt.total.toLocaleString()}
      </p>
    </motion.button>
  );
}
