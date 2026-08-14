"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu, X, QrCode, Globe } from "lucide-react";
import type {
  CustomerRestaurantInfo,
  CustomerBranchInfo,
  CustomerTableInfo,
  CustomerSessionInfo,
} from "@/context/CustomerTableSessionProvider";

type MenuHeaderProps = {
  restaurant: CustomerRestaurantInfo;
  branch: CustomerBranchInfo;
  table: CustomerTableInfo;
  session: CustomerSessionInfo;
  tableId: string | null;
  totalItems: number;
  showBurger: boolean;
  setShowBurger: (show: boolean) => void;
  setShowLanguageModal: (show: boolean) => void;
  setShowScanModal: (show: boolean) => void;
  onCartClick: () => void;
};

export function MenuHeader({
  restaurant,
  branch,
  table,
  session,
  tableId,
  totalItems,
  showBurger,
  setShowBurger,
  setShowLanguageModal,
  setShowScanModal,
  onCartClick,
}: MenuHeaderProps) {
  return (
    <div className="relative">
      <div className="h-52 bg-linear-to-br from-bark via-bark to-bark-mid relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://res.cloudinary.com/dtdjpi4qs/image/upload/v1786106093/__nhcnrr.jpg"
          alt="Restaurant cover"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-linear-to-b from-bark/40 via-transparent to-bark" />
      </div>

      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="flex items-center justify-between px-5 py-3">
          <button
            onClick={() => setShowBurger(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm active:bg-white/20 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLanguageModal(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm active:bg-white/20 transition-colors"
              aria-label="Change language"
            >
              <Globe className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setShowScanModal(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm active:bg-white/20 transition-colors"
              aria-label="Scan table"
            >
              <QrCode className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={onCartClick}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm relative active:bg-white/20 transition-colors"
              aria-label="View cart"
            >
              <ShoppingCart className="w-5 h-5 text-white" />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-clay rounded-full text-[9px] text-white font-medium flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-28 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-[18px] md:text-[22px] font-medium text-white leading-snug drop-shadow-sm">
              {restaurant.name}
            </h1>
            <p className="text-[13px] text-clay-mid mt-0.5 drop-shadow-sm mb-0.5">
              {branch.name}
              {branch.location ? ` · ${branch.location}` : ""}
            </p>
            <div className="bg-white rounded-2xl shadow-lg px-3 py-1 flex items-center gap-2 w-fit">
              <span className="text-[11px] text-text-hint">Table</span>
              <span className="w-px h-4 bg-black/10" />
              <span className="text-[14px] font-semibold text-clay-dark">
                {table.tableNumber}
              </span>
            </div>
          </div>
        </div>

        {session.package && (
          <motion.div
            layout
            className="bg-white rounded-2xl border border-black/8 shadow-lg p-3.5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-clay-light flex items-center justify-center shrink-0">
                <span className="text-[18px]">🍱</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-text-primary">
                  {session.package.name}
                </p>
                <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">
                  {session.package.description}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[17px] font-semibold text-clay-dark">
                  ฿{session.package.price}
                </p>
                <p className="text-[10px] text-text-hint">/ person</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
