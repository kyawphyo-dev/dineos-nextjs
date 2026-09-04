"use client";

import { Sparkles, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { FrontTable } from "@/app/types/staff";
import { useState } from "react";

interface Props {
  table: FrontTable;
  onFinishCleaning?: (tableNumber: string) => void;
}

export default function CleaningCard({ table, onFinishCleaning }: Props) {
  const [isFinishing, setIsFinishing] = useState(false);

  const handleFinish = () => {
    if (!onFinishCleaning || isFinishing) return;
    setIsFinishing(true);
    onFinishCleaning(table.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-sky-200 p-5"
    >
      <div className="bg-sky-50 rounded-xl p-3.5 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-sky-700">
            Table cleaning
          </p>
          <p className="text-[11px] text-sky-500 mt-0.5">
            Being cleaned after use
          </p>
        </div>
      </div>

      <div className="flex flex-col text-left mb-4">
        <Row label="Table" value={table.id} />
        <Row label="Seats" value={String(table.seats)} />
        <Row label="Status" value="Cleaning" valueClassName="text-sky-700" />
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <button
          onClick={handleFinish}
          disabled={isFinishing}
          className="w-full bg-sky-700/90 text-white rounded-xl py-3 text-[13px] font-medium flex items-center justify-center gap-2 active:bg-sage-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isFinishing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Finishing…
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Finish cleaning (mark available)
            </>
          )}
        </button>
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
