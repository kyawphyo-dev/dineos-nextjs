"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import UserMenu from "@/components/shared/UserMenu";
import TableCard from "@/components/staff/TableCard";
import AvailableTablePanel from "@/components/staff/AvailableTablePanel";
import QrHandoffCard from "@/components/staff/QrHandoffCard";
import ReservationCard from "@/components/staff/ReservationCard";
import NeedAttentionCard from "@/components/staff/NeedAttentionCard";
import RequestBillCard from "@/components/staff/RequestBillCard";
import type {
  CreateReservationInput,
  FrontTable,
  ReservationStatus,
  StaffPackage,
} from "@/app/types/staff";
import type { Restaurant, Table } from "@/app/types/restaurant";
import { Branch } from "@prisma/client";
import StartDiningSession from "@/lib/actions/staff/StartDiningSession.action";
import CloseDiningSession from "@/lib/actions/staff/CloseDiningSession.action";
import CreateReservation from "@/lib/actions/staff/CreateReservation.action";
import CancelReservation from "@/lib/actions/staff/CancelReservation.action";
import NoShowReservation from "@/lib/actions/staff/NoShowReservation.action";
import SeatReservation from "@/lib/actions/staff/SeatReservation.action";
import UpdateTableStatusStaff from "@/lib/actions/staff/UpdateTableStatusStaff.action";
import CancelBillRequestStaff from "@/lib/actions/staff/CancelBillRequestStaff.action";
import StatusLegend from "./StatusLegend";

interface TableWithZone extends Table {
  zone?: { id?: string; name?: string; branchId?: string };
  diningSessions?: Array<{
    id: string;
    packageId?: string | null;
    package?: { id: string; name: string } | null;
    guestCount: number;
    startedAt: string;
    startedBy?: { name: string } | null;
  }>;
  reservations?: Array<{
    id: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string | null;
    guestCount: number;
    reservedTime: string;
    status: string;
    note?: string | null;
  }>;
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
    const diningSession = table.diningSessions?.[0];
    const reservation = table.reservations?.[0];
    const normalizedStatus =
      table.status === "available" ||
      table.status === "occupied" ||
      table.status === "attention" ||
      table.status === "reserved" ||
      table.status === "need_attention" ||
      table.status === "request_bill"
        ? (table.status as FrontTable["status"])
        : "available";
    const frontTable: FrontTable = {
      id: table.tableNumber,
      seats: table.capacity,
      status: normalizedStatus,
      reservation: reservation
        ? {
            id: reservation.id,
            customerName: reservation.customerName,
            customerPhone: reservation.customerPhone,
            customerEmail: reservation.customerEmail ?? null,
            guestCount: reservation.guestCount,
            reservedTime: reservation.reservedTime,
            status: reservation.status as ReservationStatus,
            note: reservation.note ?? null,
          }
        : undefined,
      meta:
        normalizedStatus === "reserved" && reservation?.reservedTime
          ? formatReservationTime(reservation.reservedTime)
          : normalizedStatus === "need_attention"
            ? "Needs attention"
            : normalizedStatus === "request_bill"
              ? "Request bill"
              : `${table.capacity} seats`,
      session: diningSession
        ? {
            id: diningSession.id,
            packageId: diningSession.packageId ?? undefined,
            packageName: diningSession.package?.name ?? undefined,
            guestCount: diningSession.guestCount,
            startedAt: diningSession.startedAt,
            startedBy: diningSession.startedBy?.name ?? undefined,
          }
        : undefined,
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

  const handleStart = async (
    pkg: StaffPackage,
    guestCount: number,
    tableId: string,
  ) => {
    if (!branch?.id) return;

    const result = await StartDiningSession({
      tableNumber: tableId,
      packageId: pkg.id,
      guestCount,
      branchId: branch.id,
    });

    if (result.success) {
      setSelectedId(null);
      window.location.reload();
    } else {
      alert(result.message || "Failed to start session");
    }
  };

  const handleClose = async (sessionId: string, tableNumber: string) => {
    if (!branch?.id) return;

    const result = await CloseDiningSession({
      sessionId,
      tableNumber,
      branchId: branch.id,
    });

    if (result.success) {
      setSelectedId(null);
      // Refresh the page to get updated data
      window.location.reload();
    } else {
      alert(result.message || "Failed to close session");
    }
  };

  const handleReserve = async (
    reservation: CreateReservationInput,
    tableNumber: string,
  ) => {
    if (!branch?.id) return;

    const result = await CreateReservation({
      tableNumber,
      branchId: branch.id,
      ...reservation,
    });

    if (result.success) {
      setSelectedId(null);
      window.location.reload();
    } else {
      alert(result.message || "Failed to create reservation");
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    if (!branch?.id) return;

    const result = await CancelReservation({
      reservationId,
      branchId: branch.id,
    });

    if (result.success) {
      setSelectedId(null);
      window.location.reload();
    } else {
      alert(result.message || "Failed to cancel reservation");
    }
  };

  const handleNoShowReservation = async (reservationId: string) => {
    if (!branch?.id) return;

    const result = await NoShowReservation({
      reservationId,
      branchId: branch.id,
    });

    if (result.success) {
      setSelectedId(null);
      window.location.reload();
    } else {
      alert(result.message || "Failed to mark no-show");
    }
  };

  const handleSeatNow = async (params: {
    reservationId: string;
    tableNumber: string;
    packageId?: string;
    guestCount: number;
  }) => {
    if (!branch?.id) return;

    const result = await SeatReservation({
      reservationId: params.reservationId,
      tableNumber: params.tableNumber,
      branchId: branch.id,
      packageId: params.packageId ?? null,
      guestCount: params.guestCount,
    });

    if (result.success) {
      setSelectedId(null);
      window.location.reload();
    } else {
      alert(result.message || "Failed to seat reservation");
    }
  };

  const handleResolveNeedAttention = async (tableNumber: string) => {
    if (!branch?.id) return;

    const table = realTables.find((t) => t.tableNumber === tableNumber);
    if (!table) {
      alert("Table not found");
      return;
    }

    const result = await UpdateTableStatusStaff({
      tableId: table.id,
      status: "occupied",
      branchId: branch.id,
    });

    if (result.success) {
      setSelectedId(null);
      window.location.reload();
    } else {
      alert(result.message || "Failed to resolve need attention");
    }
  };

  const handleCancelRequestBill = async (tableNumber: string) => {
    if (!branch?.id) return;

    const result = await CancelBillRequestStaff({
      tableNumber,
      branchId: branch.id,
    });

    if (result.success) {
      setSelectedId(null);
      window.location.reload();
    } else {
      alert(result.message || "Failed to cancel request bill");
    }
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
                  (t) =>
                    t.status === "occupied" ||
                    t.status === "attention" ||
                    t.status === "need_attention" ||
                    t.status === "request_bill",
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
                  (t) =>
                    t.status === "occupied" ||
                    t.status === "attention" ||
                    t.status === "need_attention" ||
                    t.status === "request_bill",
                ).length
              }{" "}
              active
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:max-w-[calc(100%-360px-1.5rem)]">
          <StatusLegend />
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

                {selectedTable.status === "need_attention" ? (
                  <NeedAttentionCard
                    table={selectedTable}
                    onResolveNeedAttention={handleResolveNeedAttention}
                    onCloseSession={handleClose}
                  />
                ) : selectedTable.status === "request_bill" ? (
                  <RequestBillCard
                    table={selectedTable}
                    onCancelRequestBill={handleCancelRequestBill}
                    onCloseSession={handleClose}
                  />
                ) : selectedTable.status === "occupied" ||
                  selectedTable.status === "attention" ? (
                  <QrHandoffCard
                    table={selectedTable}
                    onCloseSession={handleClose}
                  />
                ) : selectedTable.status === "reserved" ? (
                  <ReservationCard
                    table={selectedTable}
                    packages={packages}
                    onCancel={() => {
                      const reservationId = selectedTable.reservation?.id;
                      if (!reservationId) {
                        alert("Reservation not found");
                        return;
                      }
                      void handleCancelReservation(reservationId);
                    }}
                    onNoShow={() => {
                      const reservationId = selectedTable.reservation?.id;
                      if (!reservationId) {
                        alert("Reservation not found");
                        return;
                      }
                      void handleNoShowReservation(reservationId);
                    }}
                    onSeatNow={({ packageId, guestCount }) => {
                      const reservationId = selectedTable.reservation?.id;
                      if (!reservationId) {
                        alert("Reservation not found");
                        return;
                      }
                      void handleSeatNow({
                        reservationId,
                        tableNumber: selectedTable.id,
                        packageId,
                        guestCount,
                      });
                    }}
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

function formatReservationTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
