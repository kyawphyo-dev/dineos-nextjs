"use client";

import { useState } from "react";
import { Users, X } from "lucide-react";
import type { DiningSession } from "@/app/types/cashier";

type SplitTab = "even" | "byItem";

interface Props {
  session: DiningSession;
  total: number;
  onClose: () => void;
}

export default function SplitBillPanel({ session, total, onClose }: Props) {
  const [tab, setTab] = useState<SplitTab>("even");
  const [guestCount, setGuestCount] = useState(session.guestCount);
  const [assignments, setAssignments] = useState<Record<string, number>>({}); // itemId -> guest index

  const perGuest = guestCount > 0 ? total / guestCount : 0;

  const guestTotals = Array.from({ length: guestCount }, (_, guestIdx) => {
    return session.items.reduce((sum, item) => {
      if (assignments[item.id] === guestIdx) {
        return sum + item.qty * item.price;
      }
      return sum;
    }, 0);
  });

  return (
    <div className="bg-white rounded-2xl border border-black/8 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[14px] font-medium text-text-primary flex items-center gap-1.5">
          <Users className="w-4 h-4 text-text-muted" />
          Split bill — table {session.tableId}
        </p>
        <button onClick={onClose} className="text-text-hint">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex rounded-xl border border-black/10 overflow-hidden mb-4">
        <button
          onClick={() => setTab("even")}
          className={`flex-1 py-2 text-[12px] font-medium ${
            tab === "even" ? "bg-cream-dark text-text-primary" : "text-text-muted"
          }`}
        >
          Split evenly
        </button>
        <button
          onClick={() => setTab("byItem")}
          className={`flex-1 py-2 text-[12px] font-medium ${
            tab === "byItem" ? "bg-cream-dark text-text-primary" : "text-text-muted"
          }`}
        >
          Split by item
        </button>
      </div>

      {tab === "even" ? (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[12px] text-text-muted">Number of guests</span>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setGuestCount((n) => Math.max(1, n - 1))}
                className="w-7 h-7 rounded-md border border-black/12 flex items-center justify-center text-[14px]"
              >
                −
              </button>
              <span className="text-[14px] font-medium w-5 text-center">{guestCount}</span>
              <button
                onClick={() => setGuestCount((n) => n + 1)}
                className="w-7 h-7 rounded-md border border-black/12 flex items-center justify-center text-[14px]"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            {Array.from({ length: guestCount }, (_, i) => (
              <div key={i} className="flex justify-between text-[13px] bg-cream-dark rounded-lg px-3 py-2">
                <span className="text-text-muted">Guest {i + 1}</span>
                <span className="font-medium text-text-primary">฿{Math.round(perGuest).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p className="text-[11px] text-text-hint mb-3">Tap an item to assign it to a guest</p>
          <div className="flex flex-col gap-2 mb-4">
            {session.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2">
                <span className="text-[12px] text-text-primary truncate flex-1">
                  {item.qty}× {item.name}
                </span>
                <div className="flex gap-1 flex-shrink-0">
                  {Array.from({ length: session.guestCount }, (_, guestIdx) => (
                    <button
                      key={guestIdx}
                      onClick={() =>
                        setAssignments((prev) => ({
                          ...prev,
                          [item.id]: prev[item.id] === guestIdx ? -1 : guestIdx,
                        }))
                      }
                      className={`w-6 h-6 rounded-md text-[10px] font-medium flex items-center justify-center border ${
                        assignments[item.id] === guestIdx
                          ? "bg-clay text-white border-clay"
                          : "border-black/12 text-text-hint"
                      }`}
                    >
                      {guestIdx + 1}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            {guestTotals.map((amount, i) => (
              <div key={i} className="flex justify-between text-[13px] bg-cream-dark rounded-lg px-3 py-2">
                <span className="text-text-muted">Guest {i + 1}</span>
                <span className="font-medium text-text-primary">฿{amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
