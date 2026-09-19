"use client";

import { motion } from "framer-motion";
import { useElapsed } from "@/app/hooks/useElapsed";
import { getNextStatus } from "@/context/KitchenSessionContext";
import type { Ticket, TicketStatus } from "@/app/types/kitchen";

const ACTION_LABEL: Record<string, string> = {
  preparing: "Start preparing",
  ready: "Mark ready",
  served: "Mark served",
};

const ACTION_STYLE: Record<string, string> = {
  preparing: "bg-info text-white",
  ready: "bg-gold text-white",
  served: "bg-sage-light text-sage border border-sage",
};

const STATUS_BADGE: Record<TicketStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-info-light text-info" },
  preparing: { label: "Preparing", className: "bg-gold-light text-[#9A6C10]" },
  ready: { label: "Ready", className: "bg-sage-light text-sage" },
  served: { label: "Served", className: "bg-cream-dark text-text-hint" },
};

const STATUS_BORDER: Record<TicketStatus, string> = {
  new: "border-l-4 border-l-info",
  preparing: "border-l-4 border-l-gold",
  ready: "border-l-4 border-l-sage",
  served: "border-l-4 border-l-text-hint",
};

interface Props {
  ticket: Ticket;
  onAdvance: (ticketId: string, next: string) => void;
}

export default function TicketCard({ ticket, onAdvance }: Props) {
  const elapsed = useElapsed(ticket.placedAt);
  const next = getNextStatus(ticket.status);
  const hasNote = ticket.items.some((i) => i.note);
  const badge = STATUS_BADGE[ticket.status];
  const borderAccent = STATUS_BORDER[ticket.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      className={`bg-white rounded-2xl border border-black/8 p-3 ${borderAccent}`}
    >
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[14px] font-medium text-text-primary">Table {ticket.tableId}</span>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>
            {badge.label}
          </span>
          <span className="text-[11px] text-text-hint">{elapsed}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1 mb-2.5">
        {ticket.items.map((item) => (
          <div key={item.id} className="text-[13px] text-text-primary">
            <span className="font-medium text-text-muted mr-1.5">{item.qty}×</span>
            {item.name}
          </div>
        ))}
      </div>

      {hasNote && (
        <div className="flex flex-col gap-0.5 mb-2.5">
          {ticket.items
            .filter((i) => i.note)
            .map((i) => (
              <p key={i.id} className="text-[11px] text-rose italic">
                {i.note}
              </p>
            ))}
        </div>
      )}

      {next && (
        <button
          onClick={() => onAdvance(ticket.id, next)}
          className={`w-full rounded-lg py-2 text-[12px] font-medium ${ACTION_STYLE[next]}`}
        >
          {ACTION_LABEL[next]}
        </button>
      )}
    </motion.div>
  );
}
