"use client";

import { useState } from "react";
import { CalendarClock, Soup, Utensils, X } from "lucide-react";
import { motion } from "framer-motion";
import type { FrontTable, StaffPackage } from "@/app/types/staff";

const PACKAGE_ICONS: Record<string, typeof Soup> = {
  soup: Soup,
  utensils: Utensils,
};

interface Props {
  table: FrontTable;
  onCancel: () => void;
  onNoShow: () => void;
  packages?: StaffPackage[];
  onSeatNow: (params: { packageId?: string; guestCount: number }) => void;
}

export default function ReservationCard({
  table,
  onCancel,
  onNoShow,
  packages,
  onSeatNow,
}: Props) {
  const reservation = table.reservation;
  const [selectedPkg, setSelectedPkg] = useState<StaffPackage | undefined>(
    packages?.[0],
  );
  const [guestCount, setGuestCount] = useState<number>(
    reservation?.guestCount ?? 2,
  );

  const reservedLabel = reservation?.reservedTime
    ? formatReservationTime(reservation.reservedTime)
    : "";

  const safeGuestCount = Math.max(1, Number(guestCount) || 1);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-black/8 p-5"
    >
      <div className="w-11 h-11 rounded-xl bg-clay-light flex items-center justify-center mb-3">
        <CalendarClock className="w-5 h-5 text-clay-dark" />
      </div>

      <p className="text-[14px] font-medium text-text-primary mb-1">
        Table {table.id} reserved
      </p>
      <p className="text-[12px] text-text-muted mb-4">
        {reservation?.customerName} · {reservedLabel}
      </p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between gap-3 text-[12px]">
          <span className="text-text-hint">Phone</span>
          <span className="text-text-primary">
            {reservation?.customerPhone}
          </span>
        </div>
        {reservation?.customerEmail ? (
          <div className="flex items-center justify-between gap-3 text-[12px]">
            <span className="text-text-hint">Email</span>
            <span className="text-text-primary">
              {reservation.customerEmail}
            </span>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3 text-[12px]">
          <span className="text-text-hint">Guests</span>
          <span className="text-text-primary">{reservation?.guestCount}</span>
        </div>
        {reservation?.note ? (
          <div className="text-[12px] text-text-muted">{reservation.note}</div>
        ) : null}
      </div>

      {packages?.length ? (
        <>
          <p className="text-[12px] text-text-muted mb-2">Choose package</p>
          <div className="flex flex-col gap-2 mb-4">
            {packages.map((pkg) => {
              const Icon = PACKAGE_ICONS[pkg.icon ?? ""] ?? Soup;
              return (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPkg(pkg)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                    selectedPkg?.id === pkg.id
                      ? "border-clay border-2"
                      : "border-black/10"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-clay-light flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-clay-dark" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-text-primary">
                      {pkg.name}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      {pkg.description}
                    </p>
                  </div>
                  <p className="text-[13px] font-medium text-clay-dark whitespace-nowrap">
                    ฿{pkg.price} / person
                  </p>
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      <p className="text-[12px] text-text-muted mb-1.5">Guest count</p>
      <input
        type="number"
        min={1}
        value={guestCount}
        onChange={(e) => setGuestCount(Number(e.target.value))}
        className="w-full rounded-xl border border-black/12 px-3.5 py-2.5 text-[14px] text-text-primary outline-none focus:border-clay mb-4"
      />

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() =>
          onSeatNow({ packageId: selectedPkg?.id, guestCount: safeGuestCount })
        }
        className="w-full bg-clay text-white rounded-xl py-3 text-[14px] font-medium mb-2 active:bg-clay-dark transition-colors"
      >
        Guest has arrived — seat now
      </motion.button>

      <button
        onClick={onNoShow}
        className="w-full border border-black/12 text-text-muted rounded-xl py-2.5 text-[13px] font-medium mb-2"
      >
        Mark no-show
      </button>

      <button
        onClick={onCancel}
        className="w-full border border-black/12 text-text-muted rounded-xl py-2.5 text-[13px] font-medium flex items-center justify-center gap-1.5"
      >
        <X className="w-3.5 h-3.5" />
        Cancel reservation
      </button>
    </motion.div>
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
