"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Search, ChevronLeft, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DietaryBadge, SpiceBadge } from "../../../components/ui/DietaryTag";
import { CATEGORIES,MENU_ITEMS } from "@/app/customers/data/mock";
import { useCart } from "@/context/CartContext";
import type { MenuItem } from "@/app/customers/types";
import ROUTES from "@/route";

export default function MenuPage() {
  const router = useRouter();
  const { totalItems, totalPrice, getQty, addItem, removeItem } = useCart();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchCat = activeCategory === "All" || item.category === activeCategory;
      const matchSearch =
        search === "" ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, search]);

  return (
    <div className="flex flex-col min-h-screen bg-cream">

      <div className="bg-bark sticky top-0 z-10">
        <div className="flex items-center justify-between px-5 py-3">
          {/* back button */}
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10"
          >
            <ChevronLeft className="w-4 h-4 text-white/80" />
          </button>
          <span className="text-[16px] font-medium text-white">Menu</span>
          {/* cart */}
          <button
            onClick={() => router.push(ROUTES.CUSTOMER_CART('A-07'))}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 relative"
          >
            <ShoppingCart className="w-4 h-4 text-white/85" />
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.span
                  key="badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-clay rounded-full text-[9px] text-white font-medium flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        <div className="mx-5 mb-3 bg-white/10 rounded-xl flex items-center gap-2 px-3 py-2">
          <Search className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes…"
            className="bg-transparent text-[13px] text-white placeholder-white/40 outline-none flex-1 min-w-0"
          />
        </div>

        <div className="flex overflow-x-auto scrollbar-hide border-b border-white/10 px-5 gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`py-2 px-3.5 text-[13px] whitespace-nowrap border-b-2 -mb-px transition-colors ${
                activeCategory === cat ? "text-clay-mid border-clay" : "text-white/50 border-transparent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 py-4">
        <p className="text-[11px] font-medium text-text-hint uppercase tracking-wider mb-3">
          {activeCategory === "All" ? "Chef's picks" : activeCategory}
        </p>
        <div className="flex flex-col gap-2.5">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <MenuItemCard
                  item={item}
                  qty={getQty(item.id)}
                  onAdd={() => addItem(item)}
                  onRemove={() => removeItem(item)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-text-hint text-[14px]">
              No dishes match your search.
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="sticky bottom-0 px-5 py-4 bg-cream border-t border-black/8"
          >
            <button
              onClick={() => router.push("/orders")}
              className="w-full bg-clay text-white rounded-2xl py-3.5 text-[15px] font-medium flex items-center justify-between px-5 active:bg-clay-dark transition-colors"
            >
              <span className="bg-white/20 rounded-lg px-2 py-0.5 text-[13px]">{totalItems}</span>
              <span>View orders</span>
              <span className="text-[15px] font-medium">฿{totalPrice}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItemCard({
  item,
  qty,
  onAdd,
  onRemove,
}: {
  item: MenuItem;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-black/8 flex items-center gap-3 p-3">
      <div className="w-16 h-16 rounded-xl bg-cream-dark flex items-center justify-center text-[28px] flex-shrink-0">
        {item.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-text-primary truncate">{item.name}</p>
        <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2 leading-snug">
          {item.description}
        </p>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {item.dietary.map((d) => (
            <DietaryBadge key={d} tag={d} />
          ))}
          {item.spice && <SpiceBadge level={item.spice} />}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
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
              <button onClick={onRemove} className="w-5 h-5 bg-clay rounded-md flex items-center justify-center">
                <Minus className="w-3 h-3 text-white" />
              </button>
              <span className="text-[13px] font-medium text-clay-dark w-4 text-center">{qty}</span>
              <button onClick={onAdd} className="w-5 h-5 bg-clay rounded-md flex items-center justify-center">
                <Plus className="w-3 h-3 text-white" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
