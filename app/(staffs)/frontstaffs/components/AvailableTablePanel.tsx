"use client";

import { useState } from "react";
import StartSessionPanel from "../components/StartSessionPanel";
import ReservePanel from "../components/ReservePanel";
import type { Package, Reservation } from "../types";

type Tab = "start" | "reserve";

interface Props {
  tableId: string;
  onStart: (pkg: Package, guestCount: number) => void;
  onReserve: (reservation: Reservation) => void;
}

export default function AvailableTablePanel({ tableId, onStart, onReserve }: Props) {
  const [tab, setTab] = useState<Tab>("start");

  return (
    <div>
      <div className="flex rounded-xl border border-black/10 overflow-hidden bg-white mb-3">
        <button
          onClick={() => setTab("start")}
          className={`flex-1 py-2 text-[12px] font-medium ${
            tab === "start" ? "bg-cream-dark text-text-primary" : "text-text-muted"
          }`}
        >
          Start session
        </button>
        <button
          onClick={() => setTab("reserve")}
          className={`flex-1 py-2 text-[12px] font-medium ${
            tab === "reserve" ? "bg-cream-dark text-text-primary" : "text-text-muted"
          }`}
        >
          Reserve for later
        </button>
      </div>

      {tab === "start" ? (
        <StartSessionPanel tableId={tableId} onStart={onStart} />
      ) : (
        <ReservePanel tableId={tableId} onReserve={onReserve} />
      )}
    </div>
  );
}
