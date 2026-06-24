"use client";

import { motion } from "framer-motion";
import { useElapsed } from "@/app/hooks/useElapsed";
import { getNextStatus } from "@/context/TicketsContext";
import type { Ticket } from "@/app/types/kitchen";

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

interface Props {
  ticket: Ticket;
  onAdvance: (ticketId: string, next: string) => void;
}

export default function TicketCard({ ticket, onAdvance }: Props) {
  const elapsed = useElapsed(ticket.placedAt);
  const next = getNextStatus(ticket.status);
  const hasNote = ticket.items.some((i) => i.note);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      className="bg-white rounded-2xl border border-black/8 p-3"
    >
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[14px] font-medium text-text-primary">Table {ticket.tableId}</span>
        <span className="text-[11px] text-text-hint">{elapsed}</span>
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
