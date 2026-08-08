"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import {
  ChevronLeft,
  Plus,
  Minus,
  ShoppingBag,
  Trash2,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrdersContext";
import { useCustomerTableSession } from "@/app/(customer)/table/[id]/CustomerTableSessionProvider";
import type { CartItem, CustomerOrder } from "@/app/types/customer";

function formatPlacedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "Just now";
  }
}

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
  const { table } = useCustomerTableSession();
  const id = params.id as string;

  useEffect(() => {
    if (id) setTableId(id);
  }, [id, setTableId]);
  const { placeOrder } = useOrders();

  const handlePlaceOrder = () => {
    if (!tableId) return;
    placeOrder(cart, tableId);
    clearCart();
    router.push(`/table/${tableId}/orders`);
  };

  const displayTableNumber = table?.tableNumber ?? tableId ?? "—";

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

      <div className="flex-1 px-5 py-4">
        {cart.length === 0 ? (
          <EmptyCart onBrowse={() => router.push(`/table/${tableId}/menu`)} />
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
        <div className="px-5 py-4 border-t border-black/8 bg-cream">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[13px] font-medium text-text-muted">
              Subtotal
            </span>
            <span className="text-[18px] font-medium text-clay-dark">
              ฿{totalPrice}
            </span>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handlePlaceOrder}
            className="w-full bg-clay text-white rounded-2xl py-3.5 text-[15px] font-medium flex items-center justify-center gap-2 active:bg-clay-dark transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Place order
          </motion.button>
        </div>
      )}
    </div>
  );
}

function CartItemRow({
  item,
  onAdd,
  onRemove,
}: {
  item: CartItem;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.18 }}
      className="bg-white rounded-2xl border border-black/8 flex items-center gap-3 p-3"
    >
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-14 h-14 rounded-xl object-cover shrink-0 bg-cream-dark"
        />
      ) : (
        <div className="w-14 h-14 rounded-xl bg-cream-dark flex items-center justify-center text-[24px] shrink-0">
          {item.emoji ?? "🍽️"}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-text-primary truncate">
          {item.name}
        </p>
        <p className="text-[13px] text-clay-dark font-medium mt-0.5">
          ฿{item.price}
        </p>
      </div>
      <div className="flex items-center gap-1.5 bg-clay-light rounded-lg px-1.5 py-1 shrink-0">
        {item.qty === 1 ? (
          <button
            onClick={onRemove}
            className="w-5 h-5 flex items-center justify-center text-clay-dark"
            aria-label="Remove item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={onRemove}
            className="w-5 h-5 bg-clay rounded-md flex items-center justify-center"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3 h-3 text-white" />
          </button>
        )}
        <span className="text-[13px] font-medium text-clay-dark w-4 text-center">
          {item.qty}
        </span>
        <button
          onClick={onAdd}
          className="w-5 h-5 bg-clay rounded-md flex items-center justify-center"
          aria-label="Increase quantity"
        >
          <Plus className="w-3 h-3 text-white" />
        </button>
      </div>
    </motion.div>
  );
}

function EmptyCart({ onBrowse }: { onBrowse: () => void }) {
  const { orders } = useCustomerTableSession();

  const recentOrderHint = useMemo(() => {
    if (orders.length === 0) return null;
    const latest = orders[0];
    return {
      items: latest.items.reduce((s, i) => s + i.qty, 0),
      time: formatPlacedAt(latest.placedAt),
    };
  }, [orders]);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-clay-light flex items-center justify-center mb-4">
        <ShoppingBag className="w-7 h-7 text-clay-dark" />
      </div>
      <p className="text-[15px] font-medium text-text-primary mb-1">
        Your cart is empty
      </p>
      <p className="text-[13px] text-text-muted mb-5 max-w-xs mx-auto">
        Add some dishes from the menu to get started.
      </p>
      {recentOrderHint && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-black/8 text-[12px] text-text-muted mb-5">
          <Clock className="w-3.5 h-3.5 text-text-hint" />
          <span>
            Last order · {recentOrderHint.items} items · {recentOrderHint.time}
          </span>
        </div>
      )}
      <button
        onClick={onBrowse}
        className="bg-clay text-white rounded-xl px-5 py-2.5 text-[13px] font-medium"
      >
        Browse menu
      </button>
    </div>
  );
}

export type { CustomerOrder };
