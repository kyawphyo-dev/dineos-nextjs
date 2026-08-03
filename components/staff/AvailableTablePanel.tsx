"use client";

import { useState } from "react";
import StartSessionPanel from "@/components/staff/StartSessionPanel";
import ReservePanel from "@/components/staff/ReservePanel";
import type { StaffPackage, CreateReservationInput } from "@/app/types/staff";

type Tab = "start" | "reserve";

interface Props {
  packages?: StaffPackage[];
  tableId: string;
  onStart: (pkg: StaffPackage, guestCount: number, tableId: string) => void;
  onReserve: (reservation: CreateReservationInput, tableId: string) => void;
}

export default function AvailableTablePanel({
  packages,
  tableId,
  onStart,
  onReserve,
}: Props) {
  const [tab, setTab] = useState<Tab>("start");

  return (
    <div>
      <div className="flex rounded-xl border border-black/10 overflow-hidden bg-white mb-3">
        <button
          onClick={() => setTab("start")}
          className={`flex-1 py-2 text-[12px] font-medium transition-all ${
            tab === "start"
              ? "text-text-muted"
              : " bg-cream-dark text-text-primary"
          }`}
        >
          Start session
        </button>
        <button
          onClick={() => setTab("reserve")}
          className={`flex-1 py-2 text-[12px] font-medium transition-all  ${
            tab === "reserve"
              ? "text-text-muted"
              : " bg-cream-dark text-text-primary"
          }`}
        >
          Reserve for later
        </button>
      </div>

      {tab === "start" ? (
        <StartSessionPanel
          tableId={tableId}
          onStart={onStart}
          packages={packages}
        />
      ) : (
        <ReservePanel
          tableId={tableId}
          onReserve={(reservation) => onReserve(reservation, tableId)}
        />
      )}
    </div>
  );
}
