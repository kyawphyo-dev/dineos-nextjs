"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Menu,
  X,
  QrCode,
  Globe,
  ChevronRight,
  Phone,
  Receipt,
  Clock,
  CreditCard,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { DietaryBadge, SpiceBadge } from "@/components/shared/DietaryTag";
import { CATEGORIES, CUSTOMER_MENU_ITEMS } from "@/app/data/customer-mock";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrdersContext";
import { useCustomerTableSession } from "@/app/(customer)/table/[id]/CustomerTableSessionProvider";
import type { CustomerMenuItem } from "@/app/types/customer";

export default function MenuPage() {
  const router = useRouter();
  const params = useParams();
  const {
    totalItems,
    totalPrice,
    getQty,
    addItem,
    removeItem,
    tableId,
    setTableId,
  } = useCart();
  const { orders } = useOrders();
  const { table, session } = useCustomerTableSession();
  const id = params.id as string;

  useEffect(() => {
    if (id) setTableId(id);
  }, [id, setTableId]);

  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showBurger, setShowBurger] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [language, setLanguage] = useState("EN");
  const [sessionElapsed, setSessionElapsed] = useState("0h 0m");

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const diffMs = Date.now() - startTime;
      const minutes = Math.floor(diffMs / 60_000);
      const hours = Math.floor(minutes / 60);
      const remMinutes = minutes % 60;
      setSessionElapsed(`${hours}h ${remMinutes}m`);
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    return CUSTOMER_MENU_ITEMS.filter((item) => {
      const matchCat =
        activeCategory === "All" || item.category === activeCategory;
      const matchSearch =
        search === "" ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, search]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: CUSTOMER_MENU_ITEMS.length };
    CUSTOMER_MENU_ITEMS.forEach((item) => {
      counts[item.category] = (counts[item.category] ?? 0) + 1;
    });
    return counts;
  }, []);

  const orderedItemCount = useMemo(() => {
    return orders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0),
      0,
    );
  }, [orders]);

  const orderedTotal = useMemo(() => {
    return orders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.price * i.qty, 0),
      0,
    );
  }, [orders]);

  const handleCallStaff = () => {
    toast.success("Staff has been notified");
    setShowBurger(false);
  };

  const handleRequestBill = () => {
    toast.success("Bill requested");
    setShowBurger(false);
  };

  const LANGUAGES = [
    { code: "EN", label: "English" },
    { code: "TH", label: "ไทย" },
    { code: "ZH", label: "中文" },
    { code: "JA", label: "日本語" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <div className="relative">
        <div className="h-52 bg-linear-to-br from-bark via-bark to-bark-mid relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=elegant%20thai%20restaurant%20interior%20with%20warm%20lighting%20wooden%20tables%20decorative%20plants&image_size=landscape_16_9"
            alt="Restaurant cover"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-linear-to-b from-bark/40 via-transparent to-bark" />
        </div>

        <div className="absolute top-0 left-0 right-0 z-20">
          <div className="flex items-center justify-between px-5 py-3">
            <button
              onClick={() => setShowBurger(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm active:bg-white/20 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLanguageModal(true)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm active:bg-white/20 transition-colors"
                aria-label="Change language"
              >
                <Globe className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => setShowScanModal(true)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm active:bg-white/20 transition-colors"
                aria-label="Scan table"
              >
                <QrCode className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => router.push(`/table/${tableId}/cart`)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm relative active:bg-white/20 transition-colors"
                aria-label="View cart"
              >
                <ShoppingCart className="w-5 h-5 text-white" />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-clay rounded-full text-[9px] text-white font-medium flex items-center justify-center"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 -mt-28 relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-[22px] font-medium text-white leading-snug drop-shadow-sm">
                Baan Rim Naam
              </h1>
              <p className="text-[13px] text-clay-mid mt-0.5 drop-shadow-sm">
                Sukhumvit Branch · Bangkok
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg px-3.5 py-2 flex items-center gap-2">
              <span className="text-[11px] text-text-hint">Table</span>
              <span className="w-px h-4 bg-black/10" />
              <span className="text-[17px] font-semibold text-clay-dark">
                {table.tableNumber}
              </span>
            </div>
          </div>

          {session.package && (
            <motion.div
              layout
              className="bg-white rounded-2xl border border-black/8 shadow-lg p-3.5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-clay-light flex items-center justify-center shrink-0">
                  <span className="text-[18px]">🍱</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-text-primary">
                    {session.package.name}
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">
                    {session.package.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[17px] font-semibold text-clay-dark">
                    ฿{session.package.price}
                  </p>
                  <p className="text-[10px] text-text-hint">/ person</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

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
          {activeCategory === "All" ? "Chef's picks" : activeCategory}
        </p>
        <button
          onClick={() => {
            setShowSearch((s) => !s);
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

      <div className="flex overflow-x-auto scrollbar-hide px-5 gap-1.5 pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`py-2 px-3.5 text-[13px] whitespace-nowrap rounded-xl flex items-center gap-1.5 transition-all ${
              activeCategory === cat
                ? "bg-clay text-white shadow-sm"
                : "bg-white border border-black/8 text-text-muted hover:bg-cream-dark"
            }`}
          >
            <span>{cat}</span>
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
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

      <div className="flex-1 px-5 py-3">
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
              onClick={() => router.push(`/table/${tableId}/cart`)}
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

      <AnimatePresence>
        {showBurger && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBurger(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.aside
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
                      Baan Rim Naam
                    </h2>
                    <p className="text-[12px] text-clay-mid mt-0.5">
                      Sukhumvit Branch
                    </p>
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
                      <p className="text-[11px] text-text-muted">
                        Ordered items
                      </p>
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
                  {CATEGORIES.map((cat) => (
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
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScanModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScanModal(false)}
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-5"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-5 pointer-events-none"
            >
              <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl pointer-events-auto overflow-hidden">
                <div className="bg-bark px-5 py-4 flex items-center justify-between">
                  <h3 className="text-[16px] font-medium text-white">
                    Scan Table Number
                  </h3>
                  <button
                    onClick={() => setShowScanModal(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 active:bg-white/20"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="p-5">
                  <div className="bg-cream-dark rounded-2xl h-64 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                    <div className="absolute inset-8 border-2 border-clay border-dashed rounded-2xl animate-pulse" />
                    <div className="w-16 h-16 rounded-2xl bg-clay-light flex items-center justify-center">
                      <QrCode className="w-8 h-8 text-clay-dark" />
                    </div>
                    <div className="text-center z-10">
                      <p className="text-[14px] font-medium text-text-primary">
                        Align QR code within frame
                      </p>
                      <p className="text-[12px] text-text-hint mt-1">
                        Camera access required · (Placeholder)
                      </p>
                    </div>
                  </div>
                  <p className="text-[12px] text-text-muted text-center mt-4 leading-relaxed">
                    Point your camera at the QR code on your table to switch to
                    another table. Current: Table {table.tableNumber}
                  </p>
                  <button
                    onClick={() => {
                      toast.success("Placeholder: QR scanner");
                      setShowScanModal(false);
                    }}
                    className="w-full mt-5 bg-clay text-white rounded-2xl py-3.5 text-[15px] font-medium active:bg-clay-dark transition-colors"
                  >
                    Open camera
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLanguageModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLanguageModal(false)}
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-5"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-5 pointer-events-none"
            >
              <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl pointer-events-auto overflow-hidden">
                <div className="bg-bark px-5 py-4 flex items-center justify-between">
                  <h3 className="text-[16px] font-medium text-white">
                    Change Language
                  </h3>
                  <button
                    onClick={() => setShowLanguageModal(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 active:bg-white/20"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="p-3">
                  <div className="flex flex-col gap-1.5">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          toast.success(
                            `Language: ${lang.label} (Placeholder)`,
                          );
                          setShowLanguageModal(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-colors ${
                          language === lang.code
                            ? "bg-clay text-white shadow-sm"
                            : "bg-white text-text-primary hover:bg-cream-dark"
                        }`}
                      >
                        <span className="text-[14px] font-medium">
                          {lang.label}
                        </span>
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                            language === lang.code
                              ? "bg-white/20 text-white"
                              : "bg-cream-dark text-text-hint"
                          }`}
                        >
                          {lang.code}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-text-hint text-center mt-4 mb-2 px-2">
                    Placeholder · Language switching is not functional yet.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
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
  item: CustomerMenuItem;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-black/8 flex items-center gap-3 p-3">
      <div className="w-16 h-16 rounded-xl bg-cream-dark flex items-center justify-center text-[28px] shrink-0">
        {item.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-text-primary truncate">
          {item.name}
        </p>
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
