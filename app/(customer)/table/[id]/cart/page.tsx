"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ChevronLeft, ShoppingBag, Loader2, Receipt, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import PlaceOrderAction from "@/lib/actions/customer/PlaceOrder.action";
import UpdateTableStatusCustomer from "@/lib/actions/customer/UpdateTableStatusCustomer.action";
import { useCart } from "@/context/CartContext";
import { useCustomerTableSession } from "@/context/CustomerTableSessionProvider";
import type { CustomerOrder } from "@/app/types/customer";
import EmptyCart from "@/components/customer/EmptyCart";
import CartItemRow from "@/components/customer/CartItemRow";

export default function CartPage() {
  const router = useRouter();
  const params = useParams();
  const {
    cart,
    tableId,
    totalPrice,
    addItem,
    removeItem,
    clearCart,
    setTableId,
  } = useCart();
  const { table, orders, session } = useCustomerTableSession();

  const ORDER_ALLOWED_STATUSES: Array<typeof session.status> = [
    "seated",
    "ordering",
    "dining",
  ];
  const isSessionOrderable = ORDER_ALLOWED_STATUSES.includes(session.status);
  const id = params.id as string;
  const [isPlacing, setIsPlacing] = useState(false);
  const [isCancellingBill, setIsCancellingBill] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (id) setTableId(id);
  }, [id, setTableId]);

  const handlePlaceOrder = async () => {
    if (!tableId) {
      toast.error("Table not found. Please scan the QR code again.");
      return;
    }
    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (!isSessionOrderable) {
      toast.error(
        "Cannot place order at this time. Please contact staff for assistance.",
      );
      return;
    }

    setIsPlacing(true);
    try {
      const orderItems = cart.map((c) => ({
        menuItemId: c.id,
        quantity: c.qty,
        price: Number(c.price),
      }));

      const res = await PlaceOrderAction({ tableId, items: orderItems });
      if (!res.success || !res.data) {
        toast.error(res.message ?? "Failed to place order. Please try again.");
        return;
      }

      clearCart();
      toast.success("Order placed successfully!");
      startTransition(() => {
        router.push(`/table/${tableId}/orders`);
      });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsPlacing(false);
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

  const displayTableNumber = table?.tableNumber ?? tableId ?? "—";
  const isRequestBillActive = table?.status === "request_bill";
  const orderingDisabled = !isSessionOrderable || isRequestBillActive;

  const getStatusBlockInfo = () => {
    if (isRequestBillActive) {
      return {
        icon: <Receipt className="w-6 h-6 text-[#9A6C10] mx-auto mb-2" />,
        title: "Bill requested",
        subtitle: "Ordering is disabled. Staff is preparing your bill.",
        cardClass: "bg-gold-light",
        titleClass: "text-[#9A6C10]",
        subtitleClass: "text-[#9A6C10]/70",
      } as const;
    }
    if (session.status === "finishedEating") {
      return {
        icon: <Receipt className="w-6 h-6 text-clay mx-auto mb-2" />,
        title: "Finished eating",
        subtitle:
          "Ordering is no longer available. Please request your bill or contact staff.",
        cardClass: "bg-clay-light/50",
        titleClass: "text-clay-dark",
        subtitleClass: "text-clay-dark/70",
      } as const;
    }
    if (session.status === "paying") {
      return {
        icon: <Receipt className="w-6 h-6 text-text-primary mx-auto mb-2" />,
        title: "Payment in progress",
        subtitle:
          "Ordering is disabled during payment. Please contact staff if you need anything.",
        cardClass: "bg-cream-dark",
        titleClass: "text-text-primary",
        subtitleClass: "text-text-muted",
      } as const;
    }
    return null;
  };

  const statusBlockInfo = getStatusBlockInfo();

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <div className="bg-bark px-5 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push(`/table/${tableId}/menu`)}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10"
        >
          <ChevronLeft className="w-4 h-4 text-white/80" />
        </button>
        <span className="text-[16px] font-medium text-white">Your Cart</span>
        <span className="ml-auto text-[12px] text-white/55">
          Table {displayTableNumber}
        </span>
      </div>

      <div className="flex-1 px-5 py-4 flex flex-col gap-3">
        {cart.length === 0 ? (
          <>
            <EmptyCart onBrowse={() => router.push(`/table/${tableId}/menu`)} />
            {orders.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  startTransition(() => {
                    router.push(`/table/${tableId}/orders`);
                  })
                }
                className="w-full border-[1.5px] border-clay text-clay rounded-2xl py-3 text-[14px] font-medium flex items-center justify-center gap-2 active:bg-clay-light transition-colors"
              >
                <Receipt className="w-4 h-4" />
                View my orders
              </motion.button>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-2.5">
            <AnimatePresence>
              {cart.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onAdd={() => addItem(item)}
                  onRemove={() => removeItem(item)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="px-5 py-4 border-t border-black/8 bg-cream flex flex-col gap-2.5">
          {orders.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                startTransition(() => {
                  router.push(`/table/${tableId}/orders`);
                })
              }
              className="w-full border-[1.5px] border-clay text-clay rounded-2xl py-3 text-[14px] font-medium flex items-center justify-center gap-2 active:bg-clay-light transition-colors"
            >
              <Receipt className="w-4 h-4" />
              View my orders
            </motion.button>
          )}
          {orderingDisabled && statusBlockInfo ? (
            <div className="flex flex-col gap-3">
              <div
                className={`${statusBlockInfo.cardClass} rounded-2xl p-4 text-center`}
              >
                {statusBlockInfo.icon}
                <p
                  className={`text-[14px] font-medium ${statusBlockInfo.titleClass}`}
                >
                  {statusBlockInfo.title}
                </p>
                <p
                  className={`text-[11px] ${statusBlockInfo.subtitleClass} mt-1`}
                >
                  {statusBlockInfo.subtitle}
                </p>
              </div>
              <div className="flex items-center justify-between mb-1 px-1">
                <span className="text-[13px] font-medium text-text-muted">
                  Subtotal
                </span>
                <span className="text-[18px] font-medium text-clay-dark">
                  ฿{totalPrice}
                </span>
              </div>
              {isRequestBillActive ? (
                <motion.button
                  whileTap={!isCancellingBill ? { scale: 0.97 } : {}}
                  onClick={handleCancelRequestBill}
                  disabled={isCancellingBill}
                  className="w-full bg-white border-[1.5px] border-text-hint text-text-primary rounded-2xl py-3.5 text-[15px] font-medium flex items-center justify-center gap-2 active:bg-cream-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isCancellingBill ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cancelling…
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      Cancel request bill to place order
                    </>
                  )}
                </motion.button>
              ) : (
                <div className="w-full bg-cream-dark border border-black/8 text-text-hint rounded-2xl py-3.5 text-[14px] font-medium flex items-center justify-center gap-2 cursor-not-allowed">
                  <Receipt className="w-4 h-4" />
                  Ordering unavailable — contact staff
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[13px] font-medium text-text-muted">
                  Subtotal
                </span>
                <span className="text-[18px] font-medium text-clay-dark">
                  ฿{totalPrice}
                </span>
              </div>
              <motion.button
                whileTap={!isPlacing ? { scale: 0.97 } : {}}
                onClick={handlePlaceOrder}
                disabled={isPlacing}
                className="w-full bg-clay text-white rounded-2xl py-3.5 text-[15px] font-medium flex items-center justify-center gap-2 active:bg-clay-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPlacing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Placing order…
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Place order
                  </>
                )}
              </motion.button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export type { CustomerOrder };
