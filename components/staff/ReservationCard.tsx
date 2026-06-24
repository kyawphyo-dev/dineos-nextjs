"use client";

import { CalendarClock, X } from "lucide-react";
import { motion } from "framer-motion";
import type { FrontTable } from "@/app/types/staff";

interface Props {
  table: FrontTable;
  onCancel: () => void;
  onSeatNow: () => void;
}

export default function ReservationCard({ table, onCancel, onSeatNow }: Props) {
  const reservation = table.reservation;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-black/8 p-5"
    >
      <div className="w-11 h-11 rounded-xl bg-clay-light flex items-center justify-center mb-3">
        <CalendarClock className="w-5 h-5 text-clay-dark" />
      </div>

      <p className="text-[14px] font-medium text-text-primary mb-1">
        Table {table.id} reserved
      </p>
      <p className="text-[12px] text-text-muted mb-4">
        {reservation?.name} · {reservation?.time}
      </p>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onSeatNow}
        className="w-full bg-clay text-white rounded-xl py-3 text-[14px] font-medium mb-2 active:bg-clay-dark transition-colors"
      >
        Guest has arrived — seat now
      </motion.button>

      <button
        onClick={onCancel}
        className="w-full border border-black/12 text-text-muted rounded-xl py-2.5 text-[13px] font-medium flex items-center justify-center gap-1.5"
      >
        <X className="w-3.5 h-3.5" />
        Cancel reservation
      </button>
    </motion.div>
  );
}
