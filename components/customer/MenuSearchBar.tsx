"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";

type MenuSearchBarProps = {
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  search: string;
  setSearch: (value: string) => void;
  activeCategory: string;
};

export function MenuSearchBar({
  showSearch,
  setShowSearch,
  search,
  setSearch,
  activeCategory,
}: MenuSearchBarProps) {
  return (
    <>
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-5"
          >
            <div className="py-3">
              <div className="bg-white rounded-xl border border-black/10 flex items-center gap-2 px-3.5 py-2.5 focus-within:border-clay transition-colors shadow-sm">
                <Search className="w-4 h-4 text-text-hint shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search dishes…"
                  className="bg-transparent text-[13px] text-text-primary placeholder:text-text-hint outline-none flex-1 min-w-0"
                  autoFocus
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="text-text-hint hover:text-text-primary transition-colors p-0.5 -m-0.5"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <p className="text-[11px] font-medium text-text-hint uppercase tracking-wider">
          {activeCategory === "All" ? "All dishes" : activeCategory}
        </p>
        <button
          onClick={() => {
            setShowSearch(!showSearch);
            if (showSearch) setSearch("");
          }}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
            showSearch
              ? "bg-clay text-white"
              : "bg-white border border-black/8 text-text-muted hover:bg-cream-dark"
          }`}
          aria-label={showSearch ? "Hide search" : "Show search"}
        >
          <Search className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );
}
