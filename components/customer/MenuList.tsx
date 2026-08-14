"use client";

import { AnimatePresence, motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";
import type { CustomerMenuItem } from "@/app/types/customer";
import { MenuItemCard } from "@/components/customer/MenuItemCard";

type MenuListProps = {
  menuItems: CustomerMenuItem[];
  filteredItems: CustomerMenuItem[];
  getQty: (itemId: string) => number;
  addItem: (item: CustomerMenuItem) => void;
  removeItem: (item: CustomerMenuItem) => void;
};

export function MenuList({
  menuItems,
  filteredItems,
  getQty,
  addItem,
  removeItem,
}: MenuListProps) {
  if (menuItems.length === 0) {
    return (
      <div className="flex-1 px-5 py-3">
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-cream-dark flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-7 h-7 text-text-hint" />
          </div>
          <p className="text-[14px] text-text-primary font-medium">
            No menu available
          </p>
          <p className="text-[12px] text-text-hint mt-1">
            Please ask staff for the menu
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-5 py-3">
      <div className="flex flex-col gap-2.5">
        <AnimatePresence>
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
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
        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-text-hint text-[14px]">
            No dishes match your search.
          </div>
        )}
      </div>
    </div>
  );
}
