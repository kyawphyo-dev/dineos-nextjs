import { motion } from "framer-motion";
import { CartItem } from "../types";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function CartItemRow({
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
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.18 }}
        className="bg-white rounded-2xl border border-black/8 flex items-center gap-3 p-3"
      >
        <div className="w-14 h-14 rounded-xl bg-cream-dark flex items-center justify-center text-[24px] flex-shrink-0">
          {item.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium text-text-primary truncate">{item.name}</p>
          <p className="text-[13px] text-clay-dark font-medium mt-0.5">฿{item.price}</p>
        </div>
        <div className="flex items-center gap-1.5 bg-clay-light rounded-lg px-1.5 py-1 flex-shrink-0">
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
          <span className="text-[13px] font-medium text-clay-dark w-4 text-center">{item.qty}</span>
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