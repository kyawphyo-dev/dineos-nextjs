"use client";

import { motion } from "framer-motion";
import type { FrontTable } from "@/app/types/staff";

const STATUS_STYLES: Record<
  FrontTable["status"],
  { bg: string; text: string; border: string }
> = {
  available: {
    bg: "bg-sage-light",
    text: "text-sage",
    border: "border-transparent",
  },
  occupied: {
    bg: "bg-gold-light",
    text: "text-[#9A6C10]",
    border: "border-transparent",
  },
  attention: {
    bg: "bg-rose-light",
    text: "text-rose",
    border: "border-transparent",
  },
  need_attention: {
    bg: "bg-rose-light",
    text: "text-rose",
    border: "border-rose/30 border-2",
  },
  request_bill: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-300 border-2",
  },
  reserved: {
    bg: "bg-white",
    text: "text-text-hint",
    border: "border-dashed border-black/15",
  },
};

interface Props {
  table: FrontTable;
  selected?: boolean;
  onClick?: () => void;
}

export default function TableCard({ table, selected, onClick }: Props) {
  const style = STATUS_STYLES[table.status];

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`rounded-2xl p-3 text-left border transition-colors relative ${style.bg} ${
        selected ? "border-clay border-2" : style.border
      }`}
    >
      {(table.status === "need_attention" ||
        table.status === "request_bill") && (
        <span
          className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-pulse"
          style={{
            backgroundColor:
              table.status === "need_attention" ? "#f43f5e" : "#7c3aed",
          }}
        />
      )}
      <p
        className={`text-[15px] font-medium ${selected ? "text-clay-dark" : style.text}`}
      >
        {table.id}
      </p>
      <p
        className={`text-[11px] mt-1 opacity-80 ${selected ? "text-clay-dark" : style.text}`}
      >
        {table.meta}
      </p>
    </motion.button>
  );
}
