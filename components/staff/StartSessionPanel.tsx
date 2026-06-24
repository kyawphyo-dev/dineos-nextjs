"use client";

import { useState } from "react";
import { Minus, Plus, QrCode, Soup, Utensils } from "lucide-react";
import { motion } from "framer-motion";
import { STAFF_PACKAGES } from "@/app/data/staff-mock";
import type { StaffPackage } from "@/app/types/staff";

const PACKAGE_ICONS: Record<string, typeof Soup> = {
  soup: Soup,
  utensils: Utensils,
};

interface Props {
  tableId: string;
  onStart: (pkg: StaffPackage, guestCount: number) => void;
}

export default function StartSessionPanel({ tableId, onStart }: Props) {
  const [selectedPkg, setSelectedPkg] = useState<StaffPackage>(STAFF_PACKAGES[0]);
  const [guestCount, setGuestCount] = useState(2);

  return (
    <div className="bg-white rounded-2xl border border-black/8 p-5">
      <p className="text-[14px] font-medium text-text-primary mb-4">
        Start session — table {tableId}
      </p>

      <p className="text-[12px] text-text-muted mb-2">Choose package</p>
      <div className="flex flex-col gap-2 mb-5">
        {STAFF_PACKAGES.map((pkg) => {
          const Icon = PACKAGE_ICONS[pkg.icon] ?? Soup;
          return (
          <button
            key={pkg.id}
            onClick={() => setSelectedPkg(pkg)}
            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
              selectedPkg.id === pkg.id ? "border-clay border-2" : "border-black/10"
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-clay-light flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-clay-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-text-primary">{pkg.name}</p>
              <p className="text-[11px] text-text-muted">{pkg.description}</p>
            </div>
            <p className="text-[13px] font-medium text-clay-dark whitespace-nowrap">
              ฿{pkg.price} / person
            </p>
          </button>
          );
        })}
      </div>

      <p className="text-[12px] text-text-muted mb-2">Guest count</p>
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => setGuestCount((n) => Math.max(1, n - 1))}
          className="w-9 h-9 rounded-lg border border-black/12 flex items-center justify-center"
          aria-label="Decrease guest count"
        >
          <Minus className="w-4 h-4 text-text-primary" />
        </button>
        <span className="text-[16px] font-medium text-text-primary w-6 text-center">
          {guestCount}
        </span>
        <button
          onClick={() => setGuestCount((n) => n + 1)}
          className="w-9 h-9 rounded-lg border border-black/12 flex items-center justify-center"
          aria-label="Increase guest count"
        >
          <Plus className="w-4 h-4 text-text-primary" />
        </button>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onStart(selectedPkg, guestCount)}
        className="w-full bg-clay text-white rounded-xl py-3 text-[14px] font-medium flex items-center justify-center gap-2 active:bg-clay-dark transition-colors"
      >
        <QrCode className="w-4 h-4" />
        Start session &amp; show QR
      </motion.button>
    </div>
  );
}
