import { CustomerMenuItem } from "@/app/types/customer";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

export function MenuItemCard({
  item,
  qty,
  onAdd,
  onRemove,
}: {
  item: CustomerMenuItem;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-black/8 flex items-center gap-3 p-3">
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-16 h-16 rounded-xl object-cover shrink-0 bg-cream-dark"
        />
      ) : (
        <div className="w-16 h-16 rounded-xl bg-cream-dark flex items-center justify-center text-[28px] shrink-0">
          {item.emoji ?? "🍽️"}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-text-primary truncate">
          {item.name}
        </p>
        <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2 leading-snug">
          {item.description || "No description"}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <p className="text-[14px] font-medium text-clay-dark">฿{item.price}</p>
        <AnimatePresence mode="wait">
          {qty === 0 ? (
            <motion.button
              key="add"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.12 }}
              onClick={onAdd}
              className="w-7 h-7 bg-clay rounded-lg flex items-center justify-center active:bg-clay-dark"
              aria-label="Add item"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
            </motion.button>
          ) : (
            <motion.div
              key="qty"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="flex items-center gap-1.5 bg-clay-light rounded-lg px-1.5 py-1"
            >
              <button
                onClick={onRemove}
                className="w-5 h-5 bg-clay rounded-md flex items-center justify-center"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3 text-white" />
              </button>
              <span className="text-[13px] font-medium text-clay-dark w-4 text-center">
                {qty}
              </span>
              <button
                onClick={onAdd}
                className="w-5 h-5 bg-clay rounded-md flex items-center justify-center"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3 text-white" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
