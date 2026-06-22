"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import TableCard from "../components/TableCard";
import StatusLegend from "../components/StatusLegend";
import AvailableTablePanel from "../components/AvailableTablePanel";
import QrHandoffCard from "../components/QrHandoffCard";
import ReservationCard from "../components/ReservationCard";
import { useTables } from "@/context/TablesContext";
import type { Package, Reservation } from "../types";

export default function StaffDashboard() {
  const { tables, getTable, startSession, closeSession, reserveTable, cancelReservation } =
    useTables();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedTable = selectedId ? getTable(selectedId) : undefined;

  const handleStart = (pkg: Package, guestCount: number) => {
    if (!selectedId) return;
    startSession(selectedId, {
      packageId: pkg.id,
      packageName: pkg.name,
      guestCount,
      startedAt: "just now",
    });
  };

  const handleClose = () => {
    if (!selectedId) return;
    closeSession(selectedId);
    setSelectedId(null);
  };

  const handleReserve = (reservation: Reservation) => {
    if (!selectedId) return;
    reserveTable(selectedId, reservation);
  };

  const handleCancelReservation = () => {
    if (!selectedId) return;
    cancelReservation(selectedId);
  };

  const handleSeatNow = () => {
    if (!selectedId) return;
    cancelReservation(selectedId);
    // Table is now "available" — panel re-renders into the Start session tab automatically.
  };

  return (
    <div className="min-h-screen bg-cream-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 relative">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-[18px] font-medium text-text-primary">Tables</h1>
            <p className="text-[12px] text-text-muted mt-0.5">Baan Rim Naam · Floor 1</p>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-text-muted">
            <Users className="w-3.5 h-3.5" />
            {tables.filter((t) => t.status === "occupied" || t.status === "attention").length} active
          </div>
        </div>

        <div className="mt-4 mb-5">
          <StatusLegend />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 lg:max-w-[calc(100%-360px-1.5rem)]">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              selected={selectedId === table.id}
              onClick={() => setSelectedId(table.id)}
            />
          ))}
        </div>

        {selectedTable && (
          <div className="fixed inset-x-0 bottom-0 lg:static lg:inset-auto lg:absolute lg:top-6 lg:right-6 lg:bottom-6 lg:w-[340px] bg-cream-dark lg:bg-transparent border-t border-black/8 lg:border-none p-4 lg:p-0 lg:mt-0 max-h-[80vh] overflow-y-auto z-20">
            <div className="lg:hidden flex justify-between items-center mb-2">
              <span className="text-[13px] font-medium text-text-muted">Table {selectedTable.id}</span>
              <button
                onClick={() => setSelectedId(null)}
                className="text-[12px] text-text-hint"
              >
                Close
              </button>
            </div>

            {selectedTable.status === "occupied" || selectedTable.status === "attention" ? (
              <QrHandoffCard table={selectedTable} onCloseSession={handleClose} />
            ) : selectedTable.status === "reserved" ? (
              <ReservationCard
                table={selectedTable}
                onCancel={handleCancelReservation}
                onSeatNow={handleSeatNow}
              />
            ) : (
              <AvailableTablePanel
                tableId={selectedTable.id}
                onStart={handleStart}
                onReserve={handleReserve}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
