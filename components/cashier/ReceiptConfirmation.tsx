"use client";

import { useState, useTransition } from "react";
import { Check, Printer, Download, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Receipt from "@/components/cashier/Receipt";
import { downloadReceiptAsPdf } from "@/lib/downloadReceipt";
import type { ReceiptRecord } from "@/app/types/cashier";

interface Props {
  receipt: ReceiptRecord;
  onClose: () => void;
}

export default function ReceiptConfirmation({ receipt, onClose }: Props) {
  const handlePrint = () => window.print();
  const handleDownload = () => downloadReceiptAsPdf(receipt.id);
  const [isClosing, startClosingTransition] = useTransition();
  const [closeError, setCloseError] = useState<string | null>(null);

  const handleClose = () => {
    setCloseError(null);
    startClosingTransition(async () => {
      try {
        await onClose();
      } catch (e) {
          setCloseError(
            e instanceof Error ? e.message : "Failed to close session",
          );
        }
      });
  };

  return (
    <div className="flex flex-col gap-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border border-black/8 p-5 text-center"
      >
        <div className="w-11 h-11 rounded-full bg-sage-light flex items-center justify-center mx-auto mb-2.5">
          <Check className="w-5.5 h-5.5 text-sage" />
        </div>
        <p className="text-[14px] font-medium text-text-primary">Payment received</p>
        <p className="text-[12px] text-text-muted mt-0.5">
          Table {receipt.tableId} · ฿{receipt.grandTotal.toLocaleString()} paid by{" "}
          {receipt.method === "qr" ? "QR Pay" : receipt.method === "card" ? "Card" : "Cash"}
        </p>
      </motion.div>

      <Receipt receipt={receipt} />

      <div className="flex gap-2">
        <button
          onClick={handlePrint}
          className="flex-1 border border-black/12 text-text-muted rounded-xl py-2.5 text-[13px] font-medium flex items-center justify-center gap-1.5 bg-white"
        >
          <Printer className="w-3.5 h-3.5" />
          Print
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 border border-black/12 text-text-muted rounded-xl py-2.5 text-[13px] font-medium flex items-center justify-center gap-1.5 bg-white"
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </button>
      </div>

      {closeError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-[12px] text-rose-600 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{closeError}</span>
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleClose}
        disabled={isClosing}
        className="w-full bg-clay text-white rounded-xl py-3 text-[14px] font-medium active:bg-clay-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isClosing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Closing session…
          </>
        ) : (
          <>Close session &amp; free table</>
        )}
      </motion.button>
    </div>
  );
}
