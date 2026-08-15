"use client";

import { motion } from "framer-motion";
import {
  X,
  Clock,
  CreditCard,
  Phone,
  Receipt,
  ShoppingCart,
  ChevronRight,
  Globe,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import type {
  CustomerRestaurantInfo,
  CustomerBranchInfo,
  CustomerTableInfo,
} from "@/context/CustomerTableSessionProvider";
import { LANGUAGES, type LanguageCode } from "./customerMenu.utils";
import UpdateTableStatusCustomer from "@/lib/actions/customer/UpdateTableStatusCustomer.action";

type BurgerSideMenuProps = {
  showBurger: boolean;
  setShowBurger: (show: boolean) => void;
  restaurant: CustomerRestaurantInfo;
  branch: CustomerBranchInfo;
  table: CustomerTableInfo;
  tableId: string | null;
  sessionElapsed: string;
  orderedItemCount: number;
  orderedTotal: number;
  categoryNames: string[];
  activeCategory: string;
  categoryCounts: Record<string, number>;
  language: LanguageCode;
  onCategoryChange: (category: string) => void;
  setShowLanguageModal: (show: boolean) => void;
  onMyOrdersClick: () => void;
  onStatusChange?: () => void;
};

function BurgerSideMenu({
  showBurger: _showBurger,
  setShowBurger,
  restaurant,
  branch,
  table,
  tableId,
  sessionElapsed,
  orderedItemCount,
  orderedTotal,
  categoryNames,
  activeCategory,
  categoryCounts,
  language,
  onCategoryChange,
  setShowLanguageModal,
  onMyOrdersClick,
  onStatusChange,
}: BurgerSideMenuProps) {
  const [isCallingStaff, setIsCallingStaff] = useState(false);
  const [isCancellingStaff, setIsCancellingStaff] = useState(false);
  const [isRequestingBill, setIsRequestingBill] = useState(false);
  const [isCancellingBill, setIsCancellingBill] = useState(false);

  const handleCallStaff = async () => {
    if (!tableId || isCallingStaff) return;
    setIsCallingStaff(true);
    try {
      const res = await UpdateTableStatusCustomer({
        tableId,
        status: "need_attention",
      });
      if (res.success) {
        toast.success("Staff has been notified!");
        setShowBurger(false);
        onStatusChange?.();
      } else {
        toast.error(res.message ?? "Failed to call staff. Please try again.");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsCallingStaff(false);
    }
  };

  const handleCancelCallStaff = async () => {
    if (!tableId || isCancellingStaff) return;
    setIsCancellingStaff(true);
    try {
      const res = await UpdateTableStatusCustomer({
        tableId,
        status: "occupied",
      });
      if (res.success) {
        toast.success("Call staff cancelled.");
        setShowBurger(false);
        onStatusChange?.();
      } else {
        toast.error(res.message ?? "Failed to cancel call staff.");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsCancellingStaff(false);
    }
  };

  const handleRequestBill = async () => {
    if (!tableId || isRequestingBill) return;
    setIsRequestingBill(true);
    try {
      const res = await UpdateTableStatusCustomer({
        tableId,
        status: "request_bill",
      });
      if (res.success) {
        toast.success("Bill requested! Staff will come to your table shortly.");
        setShowBurger(false);
        onStatusChange?.();
      } else {
        toast.error(res.message ?? "Failed to request bill. Please try again.");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsRequestingBill(false);
    }
  };

  const handleCancelRequestBill = async () => {
    if (!tableId || isCancellingBill) return;
    setIsCancellingBill(true);
    try {
      const res = await UpdateTableStatusCustomer({
        tableId,
        status: "occupied",
      });
      if (res.success) {
        toast.success("Request bill cancelled. You can continue ordering.");
        setShowBurger(false);
        onStatusChange?.();
      } else {
        toast.error(res.message ?? "Failed to cancel request bill.");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsCancellingBill(false);
    }
  };

  const isRequestBillActive = table.status === "request_bill";
  const isNeedAttentionActive = table.status === "need_attention";

  return (
    <>
      <motion.div
        key="burger-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowBurger(false)}
        className="fixed inset-0 bg-black/50 z-50"
      />
      <motion.aside
        key="burger-panel"
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-cream z-50 flex flex-col shadow-2xl"
      >
        <div className="bg-bark px-5 pt-6 pb-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-clay opacity-10 translate-x-10 -translate-y-10" />
          <div className="flex items-start justify-between relative">
            <div>
              <h2 className="text-[20px] font-medium text-white">
                {restaurant.name}
              </h2>
              <p className="text-[12px] text-clay-mid mt-0.5">{branch.name}</p>
            </div>
            <button
              onClick={() => setShowBurger(false)}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 active:bg-white/20"
              aria-label="Close menu"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="mt-4 bg-white/10 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-clay flex items-center justify-center">
                <span className="text-[14px] font-semibold text-white">
                  {table.tableNumber}
                </span>
              </div>
              <div>
                <p className="text-[11px] text-white/60">Table</p>
                <p className="text-[14px] font-medium text-white">
                  Table {table.tableNumber}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-white/60">Session</p>
              <p className="text-[14px] font-medium text-white flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3" />
                {sessionElapsed}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-b border-black/8 bg-white/60">
          <div className="bg-clay-light rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-clay flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] text-text-muted">Ordered items</p>
                <p className="text-[15px] font-semibold text-clay-dark">
                  {orderedItemCount} items
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-text-muted">Current total</p>
              <p className="text-[18px] font-bold text-clay-dark">
                ฿{orderedTotal}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 flex flex-col gap-2.5 border-b border-black/8">
          {isNeedAttentionActive ? (
            <div className="flex flex-col gap-2">
              <div className="bg-rose-light rounded-2xl p-3.5 text-center">
                <p className="text-[13px] font-medium text-rose">
                  <Phone className="w-4 h-4 inline mr-1.5" />
                  Staff has been notified. They will arrive shortly.
                </p>
              </div>
              <button
                onClick={handleCancelCallStaff}
                disabled={isCancellingStaff}
                className="w-full bg-white border-[1.5px] border-text-hint text-text-primary rounded-2xl py-3 text-[14px] font-medium flex items-center justify-center gap-2 active:bg-cream-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isCancellingStaff ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                {isCancellingStaff ? "Cancelling…" : "Cancel call staff"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleCallStaff}
              disabled={isCallingStaff}
              className="w-full bg-white border-[1.5px] border-clay text-clay rounded-2xl py-3 text-[14px] font-medium flex items-center justify-center gap-2 active:bg-clay-light transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isCallingStaff ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Phone className="w-4 h-4" />
              )}
              {isCallingStaff ? "Calling…" : "Call staff"}
            </button>
          )}

          {isRequestBillActive ? (
            <div className="flex flex-col gap-2">
              <div className="bg-gold-light rounded-2xl p-3.5 text-center">
                <p className="text-[13px] font-medium text-[#9A6C10]">
                  <Receipt className="w-4 h-4 inline mr-1.5" />
                  Bill requested. Staff is preparing your bill.
                </p>
              </div>
              <button
                onClick={handleCancelRequestBill}
                disabled={isCancellingBill}
                className="w-full bg-white border-[1.5px] border-text-hint text-text-primary rounded-2xl py-3 text-[14px] font-medium flex items-center justify-center gap-2 active:bg-cream-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isCancellingBill ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                {isCancellingBill ? "Cancelling…" : "Cancel request bill"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleRequestBill}
              disabled={isRequestingBill}
              className="w-full bg-clay text-white rounded-2xl py-3.5 text-[15px] font-medium flex items-center justify-center gap-2 active:bg-clay-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isRequestingBill ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Receipt className="w-4 h-4" />
              )}
              {isRequestingBill ? "Requesting…" : "Request bill"}
            </button>
          )}

          <button
            onClick={() => {
              onMyOrdersClick();
              setShowBurger(false);
            }}
            className="w-full bg-cream-dark text-text-primary rounded-2xl py-3 text-[14px] font-medium flex items-center justify-between px-4 active:bg-cream-dark/80 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              My orders
            </span>
            <ChevronRight className="w-4 h-4 text-text-hint" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="text-[11px] font-medium text-text-hint uppercase tracking-wider mb-3">
            Categories
          </p>
          <div className="flex flex-col gap-1.5">
            {categoryNames.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  onCategoryChange(cat);
                  setShowBurger(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                  activeCategory === cat
                    ? "bg-clay text-white shadow-sm"
                    : "bg-white border border-black/8 text-text-primary hover:bg-cream-dark"
                }`}
              >
                <span className="text-[14px] font-medium">{cat}</span>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    activeCategory === cat
                      ? "bg-white/20 text-white"
                      : "bg-cream-dark text-text-hint"
                  }`}
                >
                  {categoryCounts[cat] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-black/8 bg-white/60">
          <button
            onClick={() => {
              setShowLanguageModal(true);
              setShowBurger(false);
            }}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-text-muted hover:bg-cream-dark transition-colors"
          >
            <span className="flex items-center gap-2 text-[13px]">
              <Globe className="w-4 h-4" />
              Language
            </span>
            <span className="flex items-center gap-1 text-[13px] font-medium text-text-primary">
              {LANGUAGES.find((l) => l.code === language)?.label}
              <ChevronDown className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}

export default BurgerSideMenu;
