"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrdersContext";

import ROUTES from "@/route";
import EmptyCart from "@/app/customers/components/EmptyCart";
import CartItemRow from "@/app/customers/components/CartItemCard";

export default function CartPage() {
  const router = useRouter();
  const { cart, totalPrice, addItem, removeItem, clearCart } = useCart();
  const { placeOrder } = useOrders();

  const handlePlaceOrder = () => {
    placeOrder(cart);
    clearCart();
    router.push(ROUTES.CUSTOMER_ORDERS("A-07"));
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream">


      <div className="bg-bark px-5 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10"
        >
          <ChevronLeft className="w-4 h-4 text-white/80" />
        </button>
        <span className="text-[16px] font-medium text-white">Your Cart</span>
        <span className="ml-auto text-[12px] text-white/55">Table A-07</span>
      </div>

      <div className="flex-1 px-5 py-4">
        {cart.length === 0 ? (
          <EmptyCart onBrowse={() => router.push(ROUTES.CUSTOMER_MENU("A-07"))} />
        ) : (
          <div className="flex flex-col gap-2.5">
            <AnimatePresence mode="popLayout">
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
            <span className="text-[13px] font-medium text-text-muted">Subtotal</span>
            <span className="text-[18px] font-medium text-clay-dark">฿{totalPrice}</span>
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




