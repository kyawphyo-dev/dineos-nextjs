"use client";

import { AnimatePresence } from "framer-motion";
import TicketCard from "@/app/components/TicketCard";
import type { OrderStatus, Ticket } from "@/app/types";

const COLUMN_META: Record<OrderStatus, { label: string; textClass: string; badgeClass: string }> = {
  new: { label: "New", textClass: "text-info", badgeClass: "bg-info-light text-info" },
  preparing: { label: "Preparing", textClass: "text-[#9A6C10]", badgeClass: "bg-gold-light text-[#9A6C10]" },
  ready: { label: "Ready", textClass: "text-sage", badgeClass: "bg-sage-light text-sage" },
  served: { label: "Served", textClass: "text-text-hint", badgeClass: "bg-cream-dark text-text-hint" },
};

interface Props {
  status: OrderStatus;
  tickets: Ticket[];
  onAdvance: (ticketId: string, next: string) => void;
}

export default function KanbanColumn({ status, tickets, onAdvance }: Props) {
  const meta = COLUMN_META[status];

  return (
    <div className="flex-1 min-w-[260px]">
      <div className="flex items-center justify-between px-1 mb-2.5">
        <span className={`text-[13px] font-medium ${meta.textClass}`}>{meta.label}</span>
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${meta.badgeClass}`}>
          {tickets.length}
        </span>
      </div>
      <div className="flex flex-col gap-2.5 min-h-[60px]">
        <AnimatePresence mode="popLayout">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} onAdvance={onAdvance} />
          ))}
        </AnimatePresence>
        {tickets.length === 0 && (
          <div className="text-center text-[12px] text-text-hint py-6">No tickets</div>
        )}
      </div>
    </div>
  );
}
