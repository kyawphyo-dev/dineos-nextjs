"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import UserMenu from "@/components/shared/UserMenu";
import TableCard from "@/components/staff/TableCard";
import AvailableTablePanel from "@/components/staff/AvailableTablePanel";
import QrHandoffCard from "@/components/staff/QrHandoffCard";
import ReservationCard from "@/components/staff/ReservationCard";
import type { FrontTable, StaffPackage, Reservation } from "@/app/types/staff";
import type { Restaurant, Table } from "@/app/types/restaurant";
import { Branch } from "@prisma/client";

interface TableWithZone extends Table {
  zone?: { id?: string; name?: string; branchId?: string };
}

interface BranchWithRestaurant extends Branch {
  restaurant?: Restaurant;
}

interface Props {
  tables: TableWithZone[];
  branch?: BranchWithRestaurant;
  packages?: StaffPackage[];
}

interface GroupedTables {
  [zoneName: string]: FrontTable[];
}

export default function StaffDashboard({
  tables: realTables,
  branch,
  packages,
}: Props) {
  const groupedTables: GroupedTables = realTables.reduce((acc, table) => {
    const zoneName = table.zone?.name || "Unassigned";
    const frontTable: FrontTable = {
      id: table.tableNumber,
      seats: table.capacity,
      status: (table.status as FrontTable["status"]) || "available",
      meta: `${table.capacity} seats`,
    };

    if (!acc[zoneName]) {
      acc[zoneName] = [];
    }
    acc[zoneName].push(frontTable);
    return acc;
  }, {} as GroupedTables);

  const allTables: FrontTable[] = Object.values(groupedTables).flat();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedTable = selectedId
    ? allTables.find((t) => t.id === selectedId)
    : undefined;

  const handleStart = (pkg: StaffPackage, guestCount: number) => {
    console.log("Start session (placeholder)", { selectedId, pkg, guestCount });
  };

  const handleClose = () => {
    console.log("Close session (placeholder)", { selectedId });
    setSelectedId(null);
  };

  const handleReserve = (reservation: Reservation) => {
    console.log("Reserve table (placeholder)", { selectedId, reservation });
  };

  const handleCancelReservation = () => {
    console.log("Cancel reservation (placeholder)", { selectedId });
  };

  const handleSeatNow = () => {
    console.log("Seat now (placeholder)", { selectedId });
  };

  return (
    <div className="min-h-screen bg-cream-dark relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-6">
        {/* Desktop layout (sm and up) */}
        <div className="hidden sm:flex items-center justify-between mb-1">
          <div>
            <h1 className="text-[18px] font-medium text-text-primary">
              Tables
            </h1>
            <p className="text-[12px] text-text-muted mt-0.5">
              {branch?.restaurant?.name || ""} . {branch?.name || ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[12px] text-text-muted">
              <Users className="w-3.5 h-3.5" />
              {
                allTables.filter(
                  (t) => t.status === "occupied" || t.status === "attention",
                ).length
              }{" "}
              active
            </div>
            <UserMenu />
          </div>
        </div>
        {/* Mobile layout */}
        <div className="flex flex-col sm:hidden gap-3">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-[18px] font-medium text-text-primary">
                Tables
              </h1>
              <p className="text-[12px] text-text-muted mt-0.5">
                {branch?.restaurant?.name || ""} . {branch?.name || ""}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-text-muted">
              <Users className="w-3.5 h-3.5" />
              {
                allTables.filter(
                  (t) => t.status === "occupied" || t.status === "attention",
                ).length
              }{" "}
              active
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:max-w-[calc(100%-360px-1.5rem)]">
          {Object.entries(groupedTables).map(([zoneName, tables]) => (
            <div key={zoneName}>
              <h2 className="text-[14px] font-semibold text-text-secondary mb-3">
                {zoneName}
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-2.5">
                {tables.map((table) => (
                  <TableCard
                    key={table.id}
                    table={table}
                    selected={selectedId === table.id}
                    onClick={() => setSelectedId(table.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {selectedTable && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setSelectedId(null)}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-cream-dark w-100 max-w-md rounded-2xl border border-black/8 p-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[13px] font-medium text-text-muted">
                    Table {selectedTable.id}
                  </span>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="text-[12px] text-text-hint flex items-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Close
                  </button>
                </div>

                {selectedTable.status === "occupied" ||
                selectedTable.status === "attention" ? (
                  <QrHandoffCard
                    table={selectedTable}
                    onCloseSession={handleClose}
                  />
                ) : selectedTable.status === "reserved" ? (
                  <ReservationCard
                    table={selectedTable}
                    onCancel={handleCancelReservation}
                    onSeatNow={handleSeatNow}
                  />
                ) : (
                  <AvailableTablePanel
                    packages={packages}
                    tableId={selectedTable.id}
                    onStart={handleStart}
                    onReserve={handleReserve}
                  />
                )}
              </div>
            </div>
          </>
        )}

        <div className="fixed bottom-0 right-0 sm:hidden bg-cream-dark px-4 py-3 z-40">
          <UserMenu />
        </div>
        <div className="sm:hidden h-20" />
      </div>
    </div>
  );
}
