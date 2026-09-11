"use client";

import { motion } from "framer-motion";
import type { DiningSession } from "@/app/types/cashier";

const STATUS_BADGE: Record<
  DiningSession["status"],
  { label: string; className: string }
> = {
  dining: { label: "Dining", className: "bg-gold-light text-[#9A6C10]" },
  paying: { label: "Paying", className: "bg-sage-light text-sage" },
  finished: {
    label: "Finished eating",
    className: "bg-info-light text-info",
  },
  billed: {
    label: "Billed",
    className: "bg-sage text-white",
  },
};

interface Props {
  session: DiningSession;
  selected?: boolean;
  onClick: () => void;
}

export default function SessionRow({ session, selected, onClick }: Props) {
  const subtotal = session.items.reduce(
    (sum, item) => sum + item.qty * item.price,
    0,
  );
  const total = session.billGrandTotal ?? subtotal;
  const badge = STATUS_BADGE[session.status] ?? STATUS_BADGE.dining;

  return (
    <div
      className={`w-full flex items-center gap-3 bg-white rounded-2xl border p-3.5 transition-colors ${
        selected ? "border-clay border-2" : "border-black/8"
      }`}
    >
      <motion.button
        whileTap={{ scale: 0.99 }}
        onClick={onClick}
        className="flex items-center gap-3 flex-1 text-left min-w-0"
      >
        <div className="w-14 flex-shrink-0">
          <p className="text-[14px] font-medium text-text-primary">
            {session.tableId}
          </p>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-text-muted truncate">
            {session.packageName} · {session.guestCount} guests
          </p>
          <p className="text-[11px] text-text-hint mt-0.5">
            Seated {session.seatedMinutesAgo} min
          </p>
        </div>
      </motion.button>

      <span
        className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${badge.className}`}
      >
        {badge.label}
      </span>

      <p className="text-[14px] font-medium text-text-primary flex-shrink-0 w-20 text-right">
        ฿{total.toLocaleString()}
      </p>
    </div>
  );
}
