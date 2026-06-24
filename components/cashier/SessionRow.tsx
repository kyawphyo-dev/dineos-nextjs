"use client";

import { motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";
import type { DiningSession } from "@/app/types/cashier";

const STATUS_BADGE: Record<DiningSession["status"], { label: string; className: string }> = {
  dining: { label: "Dining", className: "bg-gold-light text-[#9A6C10]" },
  finished: { label: "Finished eating", className: "bg-info-light text-info" },
  billed: { label: "Billed", className: "bg-sage-light text-sage" },
};

interface Props {
  session: DiningSession;
  selected?: boolean;
  onClick: () => void;
  onMarkFinished?: () => void;
}

export default function SessionRow({ session, selected, onClick, onMarkFinished }: Props) {
  const total = session.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const badge = STATUS_BADGE[session.status];

  return (
    <div
      className={`w-full flex items-center gap-3 bg-white rounded-2xl border p-3.5 transition-colors ${
        selected ? "border-clay border-2" : "border-black/8"
      }`}
    >
      <motion.button whileTap={{ scale: 0.99 }} onClick={onClick} className="flex items-center gap-3 flex-1 text-left min-w-0">
        <div className="w-14 flex-shrink-0">
          <p className="text-[14px] font-medium text-text-primary">{session.tableId}</p>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-text-muted truncate">
            {session.packageName} · {session.guestCount} guests
          </p>
          <p className="text-[11px] text-text-hint mt-0.5">Seated {session.seatedMinutesAgo} min</p>
        </div>
      </motion.button>

      {session.status === "dining" && onMarkFinished && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMarkFinished();
          }}
          className="flex-shrink-0 flex items-center gap-1 text-[10px] font-medium text-info border border-info/30 bg-info-light rounded-full px-2.5 py-1"
          title="Mark this table as finished eating"
        >
          <UtensilsCrossed className="w-3 h-3" />
          Mark finished
        </button>
      )}

      {session.status !== "dining" && (
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${badge.className}`}>
          {badge.label}
        </span>
      )}

      <p className="text-[14px] font-medium text-text-primary flex-shrink-0 w-20 text-right">
        ฿{total.toLocaleString()}
      </p>
    </div>
  );
}
