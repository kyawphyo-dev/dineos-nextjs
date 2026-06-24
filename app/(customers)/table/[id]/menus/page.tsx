"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Search, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES,MENU_ITEMS } from "@/app/customers/data/mock";
import { useCart } from "@/context/CartContext";
import ROUTES from "@/route";
import MenuItemCard from "@/app/customers/components/MenuItemCard";

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

    {/* Menu navbar */}
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
              onClick={() => router.push(ROUTES.CUSTOMER_CART('A-07'))}
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


