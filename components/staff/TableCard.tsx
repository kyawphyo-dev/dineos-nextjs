"use client";

import { motion } from "framer-motion";
import type { FrontTable } from "@/app/types/staff";

const STATUS_STYLES: Record<FrontTable["status"], { bg: string; text: string; border: string }> = {
  available: { bg: "bg-sage-light", text: "text-sage", border: "border-transparent" },
  occupied: { bg: "bg-gold-light", text: "text-[#9A6C10]", border: "border-transparent" },
  attention: { bg: "bg-rose-light", text: "text-rose", border: "border-transparent" },
  reserved: { bg: "bg-white", text: "text-text-hint", border: "border-dashed border-black/15" },
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
      className={`rounded-2xl p-3 text-left border transition-colors ${style.bg} ${
        selected ? "border-clay border-2" : style.border
      }`}
    >
      <p className={`text-[15px] font-medium ${selected ? "text-clay-dark" : style.text}`}>
        {table.id}
      </p>
      <p className={`text-[11px] mt-1 opacity-80 ${selected ? "text-clay-dark" : style.text}`}>
        {table.meta}
      </p>
    </motion.button>
  );
}
