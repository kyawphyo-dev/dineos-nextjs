"use client";

import { QrCode } from "lucide-react";
import { motion } from "framer-motion";
import type { FrontTable } from "@/app/types/staff";

interface Props {
  table: FrontTable;
  onCloseSession?: () => void;
}

export default function QrHandoffCard({ table, onCloseSession }: Props) {
  const session = table.session;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-black/8 p-5 text-center"
    >
      <div className="w-40 h-40 mx-auto mb-4 bg-cream-dark rounded-xl flex items-center justify-center">
        <QrCode className="w-16 h-16 text-text-hint" strokeWidth={1.25} />
      </div>
      <p className="text-[14px] font-medium text-text-primary mb-3">Scan to view menu</p>

      <div className="flex flex-col text-left">
        <Row label="Table" value={table.id} />
        <Row label="StaffPackage" value={session?.packageName ?? "—"} />
        <Row label="Guests" value={String(session?.guestCount ?? "—")} />
        <Row
          label="Status"
          value="Session active"
          valueClassName="text-sage"
        />
      </div>

      {onCloseSession && (
        <button
          onClick={onCloseSession}
          className="w-full mt-4 border border-black/12 text-text-muted rounded-xl py-2.5 text-[13px] font-medium"
        >
          Close session
        </button>
      )}
    </motion.div>
  );
}

function Row({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between text-[13px] py-2 border-b border-black/6 last:border-b-0">
      <span className="text-text-muted">{label}</span>
      <span className={`font-medium text-text-primary ${valueClassName ?? ""}`}>{value}</span>
    </div>
  );
}
