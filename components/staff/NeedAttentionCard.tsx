"use client";

import { Phone, QrCode, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { FrontTable } from "@/app/types/staff";
import { useState } from "react";

interface Props {
  table: FrontTable;
  onResolveNeedAttention?: (tableNumber: string) => void;
  onCloseSession?: (sessionId: string, tableNumber: string) => void;
}

export default function NeedAttentionCard({
  table,
  onResolveNeedAttention,
  onCloseSession,
}: Props) {
  const session = table.session;
  const [isResolving, setIsResolving] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleResolve = () => {
    if (!onResolveNeedAttention || isResolving) return;
    setIsResolving(true);
    onResolveNeedAttention(table.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-rose/20 p-5"
    >
      <div className="bg-rose-light rounded-xl p-3.5 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose flex items-center justify-center shrink-0">
          <Phone className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-rose">
            Customer needs attention
          </p>
          <p className="text-[11px] text-rose/70 mt-0.5">
            Staff should visit this table
          </p>
        </div>
      </div>

      <div className="w-40 h-40 mx-auto mb-4 bg-cream-dark rounded-xl flex items-center justify-center">
        <QrCode className="w-16 h-16 text-text-hint" strokeWidth={1.25} />
      </div>
      <p className="text-[14px] font-medium text-text-primary mb-3 text-center">
        Scan to view menu
      </p>

      <div className="flex flex-col text-left">
        <Row label="Table" value={table.id} />
        <Row label="Package" value={session?.packageName ?? "—"} />
        <Row label="Guests" value={String(session?.guestCount ?? "—")} />
        <Row
          label="Started at"
          value={session?.startedAt ? formatDate(session.startedAt) : "—"}
        />
        {session?.startedBy && <Row label="Started by" value={session.startedBy} />}
        <Row label="Status" value="Needs attention" valueClassName="text-rose" />
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <button
          onClick={handleResolve}
          disabled={isResolving}
          className="w-full bg-sage text-white rounded-xl py-3 text-[13px] font-medium flex items-center justify-center gap-2 active:bg-sage-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isResolving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Resolving…
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Mark as resolved (back to occupied)
            </>
          )}
        </button>
        {onCloseSession && session && (
          <button
            onClick={() => onCloseSession(session.id, table.id)}
            className="w-full border border-black/12 text-text-muted rounded-xl py-2.5 text-[13px] font-medium"
          >
            Close session
          </button>
        )}
      </div>
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
      <span
        className={`font-medium text-text-primary ${valueClassName ?? ""}`}
      >
        {value}
      </span>
    </div>
  );
}
