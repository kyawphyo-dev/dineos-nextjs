"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Printer, Download } from "lucide-react";
import HistoryRow from "@/components/cashier/HistoryRow";
import Receipt from "@/components/cashier/Receipt";
import DateFilter from "@/components/cashier/DateFilter";
import {
  useCashierSessions,
  toLocalISODate,
} from "@/context/CashierSessionContext";
import { downloadReceiptAsPdf } from "@/lib/downloadReceipt";

export default function HistoryDashboard() {
  const router = useRouter();
  const { receipts, restaurant, branch } = useCashierSessions();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const todayISO = useMemo(() => toLocalISODate(new Date()), []);
  const yesterdayISO = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return toLocalISODate(d);
  }, []);

  const [dateFilter, setDateFilter] = useState<string | "all">("all");

  const filtered = useMemo(() => {
    const base =
      dateFilter === "all"
        ? receipts
        : receipts.filter((r) => r.paidDateISO === dateFilter);
    return [...base].sort((a, b) => {
      const aKey = `${a.paidDateISO} ${a.paidAt}`;
      const bKey = `${b.paidDateISO} ${b.paidAt}`;
      return bKey.localeCompare(aKey);
    });
  }, [receipts, dateFilter]);
  const selected = filtered.find((r) => r.id === selectedId);

  const allTotal = receipts.reduce((sum, r) => sum + r.grandTotal, 0);
  const dayTotal = filtered.reduce((sum, r) => sum + r.grandTotal, 0);

  return (
    <div className="min-h-screen bg-cream-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => router.push("/cashier")}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-black/8"
          >
            <ChevronLeft className="w-4 h-4 text-text-muted" />
          </button>
          <div>
            <h1 className="text-[18px] font-medium text-text-primary">
              Bill History
            </h1>
            <p className="text-[12px] text-text-muted mt-0.5">
              {restaurant.name}
              {branch.name ? ` · ${branch.name}` : ""} · All-time ฿
              {allTotal.toLocaleString()}
            </p>
            <p className="text-[12px] text-text-muted mt-0.5">
              {filtered.length} receipt
              {filtered.length !== 1 ? "s" : ""}
              {dateFilter === "all" ? " across all dates" : ` on ${dateFilter}`}
              {" · "}฿{dayTotal.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mb-5">
          <DateFilter
            value={dateFilter}
            onChange={(date) => {
              setDateFilter(date);
              setSelectedId(null);
            }}
            todayISO={todayISO}
            yesterdayISO={yesterdayISO}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          <div className="flex flex-col gap-2">
            {filtered.map((receipt) => (
              <HistoryRow
                key={receipt.id}
                receipt={receipt}
                selected={selectedId === receipt.id}
                onClick={() => setSelectedId(receipt.id)}
              />
            ))}
            {filtered.length === 0 && (
              <div className="text-center text-text-hint text-[13px] py-12">
                No bills found
                {dateFilter === "all"
                  ? " for this branch yet."
                  : ` on ${dateFilter}. Try "All" or another date.`}
              </div>
            )}
          </div>

          {selected && (
            <div className="flex flex-col gap-3">
              <Receipt receipt={selected} />
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 border border-black/12 text-text-muted rounded-xl py-2.5 text-[13px] font-medium flex items-center justify-center gap-1.5 bg-white"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>
                <button
                  onClick={() => downloadReceiptAsPdf(selected.id)}
                  className="flex-1 border border-black/12 text-text-muted rounded-xl py-2.5 text-[13px] font-medium flex items-center justify-center gap-1.5 bg-white"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
