"use client";

import { motion, AnimatePresence } from "framer-motion";

type CartFooterProps = {
  totalItems: number;
  totalPrice: number;
  onCartClick: () => void;
};

export function CartFooter({
  totalItems,
  totalPrice,
  onCartClick,
}: CartFooterProps) {
  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="sticky bottom-0 px-5 py-4 bg-cream border-t border-black/8"
        >
          <button
            onClick={onCartClick}
            className="w-full bg-clay text-white rounded-2xl py-3.5 text-[15px] font-medium flex items-center justify-between px-5 active:bg-clay-dark transition-colors"
          >
            <span className="bg-white/20 rounded-lg px-2.5 py-0.5 text-[13px]">
              {totalItems}
            </span>
            <span>View cart</span>
            <span className="text-[15px] font-medium">฿{totalPrice}</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
