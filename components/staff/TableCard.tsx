"use client";

import { motion } from "framer-motion";
import type { FrontTable } from "@/app/types/staff";

const STATUS_STYLES: Record<
  FrontTable["status"],
  { bg: string; text: string; border: string }
> = {
  available: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-dashed border-green-300",
  },
  occupied: {
    bg: "bg-blue-200",
    text: "text-blue-700",
    border: "border-dashed border-blue-300",
  },
  attention: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-dashed border-red-300",
  },
  need_attention: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-dashed border-red-300",
  },
  request_bill: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-dashed border-yellow-300",
  },
  reserved: {
    bg: "bg-sky-100",
    text: "text-sky-700",
    border: "border-dashed border-sky-300",
  },
  cleaning: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-transparent border-dashed border-gray-300",
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
        table.status === "request_bill" ||
        table.status === "cleaning") && (
        <span
          className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-pulse"
          style={{
            backgroundColor:
              table.status === "need_attention"
                ? "#dc2626"
                : table.status === "request_bill"
                  ? "#ca8a04"
                  : "#4b5563",
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
