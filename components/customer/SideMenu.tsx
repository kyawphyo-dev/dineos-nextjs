import { motion } from "framer-motion";
import React from "react";

function SideMenu({
  showBurger,
  setShowBurger,
}: {
  showBurger: boolean;
  setShowBurger: (show: boolean) => void;
}) {
  return (
    <>
      <motion.div
        key="burger-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowBurger(false)}
        className="fixed inset-0 bg-black/50 z-50"
      />
      <motion.aside
        key="burger-panel"
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-cream z-50 flex flex-col shadow-2xl"
      >
        <div className="bg-bark px-5 pt-6 pb-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-clay opacity-10 translate-x-10 -translate-y-10" />
          <div className="flex items-start justify-between relative">
            <div>
              <h2 className="text-[20px] font-medium text-white">
                {restaurant.name}
              </h2>
              <p className="text-[12px] text-clay-mid mt-0.5">{branch.name}</p>
            </div>
            <button
              onClick={() => setShowBurger(false)}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 active:bg-white/20"
              aria-label="Close menu"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="mt-4 bg-white/10 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-clay flex items-center justify-center">
                <span className="text-[14px] font-semibold text-white">
                  {table.tableNumber}
                </span>
              </div>
              <div>
                <p className="text-[11px] text-white/60">Table</p>
                <p className="text-[14px] font-medium text-white">
                  Table {table.tableNumber}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-white/60">Session</p>
              <p className="text-[14px] font-medium text-white flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3" />
                {sessionElapsed}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-b border-black/8 bg-white/60">
          <div className="bg-clay-light rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-clay flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] text-text-muted">Ordered items</p>
                <p className="text-[15px] font-semibold text-clay-dark">
                  {orderedItemCount} items
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-text-muted">Current total</p>
              <p className="text-[18px] font-bold text-clay-dark">
                ฿{orderedTotal}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 flex flex-col gap-2.5 border-b border-black/8">
          <button
            onClick={handleCallStaff}
            className="w-full bg-white border-[1.5px] border-clay text-clay rounded-2xl py-3 text-[14px] font-medium flex items-center justify-center gap-2 active:bg-clay-light transition-colors"
          >
            <Phone className="w-4 h-4" />
            Call staff
          </button>
          <button
            onClick={handleRequestBill}
            className="w-full bg-clay text-white rounded-2xl py-3.5 text-[15px] font-medium flex items-center justify-center gap-2 active:bg-clay-dark transition-colors"
          >
            <Receipt className="w-4 h-4" />
            Request bill
          </button>
          <button
            onClick={() => {
              router.push(`/table/${tableId}/orders`);
              setShowBurger(false);
            }}
            className="w-full bg-cream-dark text-text-primary rounded-2xl py-3 text-[14px] font-medium flex items-center justify-between px-4 active:bg-cream-dark/80 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              My orders
            </span>
            <ChevronRight className="w-4 h-4 text-text-hint" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="text-[11px] font-medium text-text-hint uppercase tracking-wider mb-3">
            Categories
          </p>
          <div className="flex flex-col gap-1.5">
            {allCategoryNames.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setShowBurger(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                  activeCategory === cat
                    ? "bg-clay text-white shadow-sm"
                    : "bg-white border border-black/8 text-text-primary hover:bg-cream-dark"
                }`}
              >
                <span className="text-[14px] font-medium">{cat}</span>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    activeCategory === cat
                      ? "bg-white/20 text-white"
                      : "bg-cream-dark text-text-hint"
                  }`}
                >
                  {categoryCounts[cat] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-black/8 bg-white/60">
          <button
            onClick={() => {
              setShowLanguageModal(true);
              setShowBurger(false);
            }}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-text-muted hover:bg-cream-dark transition-colors"
          >
            <span className="flex items-center gap-2 text-[13px]">
              <Globe className="w-4 h-4" />
              Language
            </span>
            <span className="flex items-center gap-1 text-[13px] font-medium text-text-primary">
              {LANGUAGES.find((l) => l.code === language)?.label}
              <ChevronDown className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}

export default SideMenu;
