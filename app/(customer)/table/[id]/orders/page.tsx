"use client";

import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Plus, Receipt, X, Phone, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useEffect, useState, useTransition } from "react";
import { useCustomerTableSession } from "@/context/CustomerTableSessionProvider";
import type { CustomerOrder } from "@/app/types/customer";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import {
  OrderCard,
  toCustomerOrderStatus,
} from "@/components/customer/OrderCard";
import UpdateTableStatusCustomer from "@/lib/actions/customer/UpdateTableStatusCustomer.action";
import CancelBillRequestCustomer from "@/lib/actions/customer/CancelBillRequestCustomer.action";

export default function OrdersPage() {
  const router = useRouter();
  const params = useParams();
  const { orders: dbOrders, table, session } = useCustomerTableSession();
  const { tableId, setTableId } = useCart();
  const id = params.id as string;

  const [isCallingStaff, setIsCallingStaff] = useState(false);
  const [isCancellingStaff, setIsCancellingStaff] = useState(false);
  const [isRequestingBill, setIsRequestingBill] = useState(false);
  const [isCancellingBill, setIsCancellingBill] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (id) setTableId(id);
  }, [id, setTableId]);

  const displayTableNumber = table?.tableNumber ?? tableId ?? "—";

  const allOrders: CustomerOrder[] = useMemo(
    () =>
      dbOrders
        .map((o) => ({
          id: o.id,
          tableId: table?.id ?? id,
          status: toCustomerOrderStatus(o.status),
          placedAt: o.placedAt,
          estimatedMin: 15,
          items: o.items.map((it) => ({
            name: it.name,
            qty: it.qty,
            price: it.price,
          })),
        }))
        .sort((a, b) => {
          const ta = a.placedAt.includes("T")
            ? new Date(a.placedAt).getTime()
            : 0;
          const tb = b.placedAt.includes("T")
            ? new Date(b.placedAt).getTime()
            : 0;
          return tb - ta;
        }),
    [dbOrders, table?.id, id],
  );

  const isRequestBillActive = table?.status === "request_bill";
  const isNeedAttentionActive = table?.status === "need_attention";
  const isFinishedEating = session?.status === "finishedEating";
  const isPaying = session?.status === "paying";
  const canCancelBillRequest = isRequestBillActive && isFinishedEating;
  const isCallStaffDisabled = isFinishedEating || isPaying;
  const hasOrders = dbOrders.length > 0;

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
        startTransition(() => {
          router.refresh();
        });
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
        startTransition(() => {
          router.refresh();
        });
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
    if (!tableId || isRequestingBill || !hasOrders) return;
    setIsRequestingBill(true);
    try {
      const res = await UpdateTableStatusCustomer({
        tableId,
        status: "request_bill",
      });
      if (res.success) {
        toast.success("Bill requested! Staff will come to your table shortly.");
        startTransition(() => {
          router.refresh();
        });
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
      const res = await CancelBillRequestCustomer({
        tableId,
      });
      if (res.success) {
        toast.success(
          res.message ?? "Request bill cancelled. You can continue ordering.",
        );
        startTransition(() => {
          router.refresh();
        });
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

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <div className="bg-bark px-5 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push(`/table/${tableId}/menu`)}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10"
        >
          <ChevronLeft className="w-4 h-4 text-white/80" />
        </button>
        <span className="text-[16px] font-medium text-white">My Orders</span>
        <span className="ml-auto text-[12px] text-white/55">
          Table {displayTableNumber}
        </span>
      </div>

      <div className="flex-1 px-5 py-4 flex flex-col gap-3">
        {allOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
        {allOrders.length === 0 && (
          <div className="text-center py-16 text-text-hint text-[14px]">
            No orders yet. Place an order from the menu to see it here.
          </div>
        )}
      </div>

      <div className="px-5 py-4 flex flex-col gap-2.5 border-t border-black/8 bg-cream">
        {isNeedAttentionActive ? (
          <div className="flex flex-col gap-2">
            <div className="bg-rose-light rounded-2xl p-3.5 text-center">
              <p className="text-[13px] font-medium text-rose">
                <Phone className="w-4 h-4 inline mr-1.5" />
                Staff has been notified. They will arrive shortly.
              </p>
            </div>
            {isCallStaffDisabled ? null : (
              <motion.button
                whileTap={!isCancellingStaff ? { scale: 0.97 } : {}}
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
              </motion.button>
            )}
          </div>
        ) : (
          <motion.button
            whileTap={
              !isCallingStaff && !isCallStaffDisabled ? { scale: 0.97 } : {}
            }
            onClick={handleCallStaff}
            disabled={isCallingStaff || isCallStaffDisabled}
            className={`w-full rounded-2xl py-3 text-[14px] font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
              isCallStaffDisabled
                ? "bg-cream-dark border-[1.5px] border-black/8 text-text-hint cursor-not-allowed"
                : "bg-white border-[1.5px] border-clay text-clay active:bg-clay-light"
            }`}
          >
            {isCallingStaff ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Phone className="w-4 h-4" />
            )}
            {isCallStaffDisabled
              ? "Staff assistance unavailable"
              : isCallingStaff
                ? "Calling…"
                : "Call staff"}
          </motion.button>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push(`/table/${tableId}/menu`)}
          className="w-full border-[1.5px] border-clay text-clay rounded-2xl py-3 text-[14px] font-medium flex items-center justify-center gap-2 active:bg-clay-light transition-colors"
        >
          <Plus className="w-4 h-4" />
          Order more
        </motion.button>

        {isRequestBillActive ? (
          <div className="flex flex-col gap-2">
            <div
              className={`rounded-2xl p-3.5 text-center ${
                isPaying ? "bg-cream-dark" : "bg-gold-light"
              }`}
            >
              <p
                className={`text-[13px] font-medium ${
                  isPaying ? "text-text-primary" : "text-[#9A6C10]"
                }`}
              >
                <Receipt className="w-4 h-4 inline mr-1.5" />
                {isPaying
                  ? "Payment in progress. Staff is processing your payment."
                  : "Bill requested. Staff is preparing your bill."}
              </p>
              {!isPaying && !canCancelBillRequest && (
                <p className="text-[11px] text-[#9A6C10]/70 mt-1">
                  Contact staff if you need to make changes.
                </p>
              )}
            </div>
            {canCancelBillRequest && (
              <motion.button
                whileTap={!isCancellingBill ? { scale: 0.97 } : {}}
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
              </motion.button>
            )}
          </div>
        ) : (
          <motion.button
            whileTap={!isRequestingBill && hasOrders ? { scale: 0.97 } : {}}
            onClick={handleRequestBill}
            disabled={isRequestingBill || !hasOrders}
            className="w-full bg-clay text-white rounded-2xl py-3.5 text-[15px] font-medium flex items-center justify-center gap-2 active:bg-clay-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isRequestingBill ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Receipt className="w-4 h-4" />
            )}
            {isRequestingBill
              ? "Requesting…"
              : !hasOrders
                ? "No orders to bill"
                : "Request bill"}
          </motion.button>
        )}
      </div>
    </div>
  );
}
