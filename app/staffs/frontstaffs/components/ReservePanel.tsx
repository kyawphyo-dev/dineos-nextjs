"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { motion } from "framer-motion";
import type { Reservation } from "../types";

interface Props {
  tableId: string;
  onReserve: (reservation: Reservation) => void;
}

export default function ReservePanel({ tableId, onReserve }: Props) {
  const [name, setName] = useState("");
  const [time, setTime] = useState("");

  const canSubmit = name.trim().length > 0 && time.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onReserve({ name: name.trim(), time: formatTime(time) });
  };

  return (
    <div className="bg-white rounded-2xl border border-black/8 p-5">
      <p className="text-[14px] font-medium text-text-primary mb-4">
        Reserve table {tableId}
      </p>

      <label className="text-[12px] text-text-muted mb-1.5 block">Guest name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Khun Anan"
        className="w-full rounded-xl border border-black/12 px-3.5 py-2.5 text-[14px] text-text-primary placeholder-text-hint outline-none focus:border-clay mb-4"
      />

      <label className="text-[12px] text-text-muted mb-1.5 block">Reservation time</label>
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="w-full rounded-xl border border-black/12 px-3.5 py-2.5 text-[14px] text-text-primary outline-none focus:border-clay mb-5"
      />

      <motion.button
        whileTap={canSubmit ? { scale: 0.98 } : undefined}
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full rounded-xl py-3 text-[14px] font-medium flex items-center justify-center gap-2 transition-colors ${
          canSubmit
            ? "bg-clay text-white active:bg-clay-dark"
            : "bg-cream-dark text-text-hint cursor-not-allowed"
        }`}
      >
        <CalendarClock className="w-4 h-4" />
        Confirm reservation
      </motion.button>
    </div>
  );
}

function formatTime(value: string): string {
  // value is "HH:MM" 24h from <input type="time">
  const [hourStr, minute] = value.split(":");
  const hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${period}`;
}
