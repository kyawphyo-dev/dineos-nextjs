"use client";

import { Receipt, QrCode, X, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { FrontTable } from "@/app/types/staff";
import { useState } from "react";

interface Props {
  table: FrontTable;
  onCancelRequestBill?: (tableNumber: string) => void;
  onCleaning?: (tableNumber: string) => void;
}

export default function RequestBillCard({
  table,
  onCancelRequestBill,
  onCleaning,
}: Props) {
  const session = table.session;
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCancel = () => {
    if (!onCancelRequestBill || isCancelling) return;
    setIsCancelling(true);
    onCancelRequestBill(table.id);
  };

  const handleCleaning = () => {
    if (!onCleaning || isCleaning) return;
    setIsCleaning(true);
    onCleaning(table.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-yellow-300 p-5"
    >
      <div className="bg-yellow-100/50 rounded-xl p-3.5 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center shrink-0">
          <Receipt className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-yellow-700">
            Bill requested
          </p>
          <p className="text-[11px] text-yellow-500 mt-0.5">
            Customer wants to pay
          </p>
        </div>
      </div>

      <div className="w-40 h-40 mx-auto mb-4 bg-cream-dark rounded-xl flex items-center justify-center">
        <QrCode className="w-16 h-16 text-text-hint" strokeWidth={1.25} />
      </div>
      <p className="text-[14px] font-medium text-text-primary mb-3 text-center">
        Scan to view menu
      </p>

      <div className="flex flex-col text-left">
        <Row label="Table" value={table.id} />
        <Row label="Package" value={session?.packageName ?? "—"} />
        <Row label="Guests" value={String(session?.guestCount ?? "—")} />
        <Row
          label="Started at"
          value={session?.startedAt ? formatDate(session.startedAt) : "—"}
        />
        {session?.startedBy && (
          <Row label="Started by" value={session.startedBy} />
        )}
        <Row
          label="Status"
          value="Request bill"
          valueClassName="text-purple-700"
        />
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <button
          onClick={handleCancel}
          disabled={isCancelling}
          className="w-full bg-white border-[1.5px] border-text-hint text-text-primary rounded-xl py-3 text-[13px] font-medium flex items-center justify-center gap-2 active:bg-cream-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isCancelling ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Cancelling…
            </>
          ) : (
            <>
              <X className="w-4 h-4" />
              Cancel request bill (back to occupied)
            </>
          )}
        </button>
        {onCleaning && (
          <button
            onClick={handleCleaning}
            disabled={isCleaning}
            className="w-full bg-gray-600 text-white rounded-xl py-3 text-[13px] font-medium flex items-center justify-center gap-2 active:bg-gray-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isCleaning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Marking cleaning…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Mark as cleaning
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function Row({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between text-[13px] py-2 border-b border-black/6 last:border-b-0">
      <span className="text-text-muted">{label}</span>
      <span className={`font-medium text-text-primary ${valueClassName ?? ""}`}>
        {value}
      </span>
    </div>
  );
}
