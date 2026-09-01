"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Receipt, X, Loader2, Phone } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useCustomerTableSession } from "@/context/CustomerTableSessionProvider";
import type { CustomerMenuItem } from "@/app/types/customer";
import { MenuHeader } from "@/components/customer/MenuHeader";
import { MenuSearchBar } from "@/components/customer/MenuSearchBar";
import { CategoryTabs } from "@/components/customer/CategoryTabs";
import { MenuList } from "@/components/customer/MenuList";
import { CartFooter } from "@/components/customer/CartFooter";
import BurgerSideMenu from "@/components/customer/BurgerSideMenu";
import ScanQrModal from "@/components/customer/ScanQrModal";
import LanguageModal from "@/components/customer/LanguageModal";
import {
  pickEmoji,
  formatDuration,
  ALL_CATEGORY,
  type LanguageCode,
} from "@/components/customer/customerMenu.utils";
import UpdateTableStatusCustomer from "@/lib/actions/customer/UpdateTableStatusCustomer.action";

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
  const { restaurant, branch, table, session, categories, orders } =
    useCustomerTableSession();
  const id = params.id as string;
  const [isCancellingBill, setIsCancellingBill] = useState(false);

  useEffect(() => {
    if (id) setTableId(id);
  }, [id, setTableId]);

  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showBurger, setShowBurger] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>("EN");
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = () => {
    router.refresh();
  };

  const handleCancelRequestBill = async () => {
    if (!tableId || isCancellingBill) return;
    setIsCancellingBill(true);
    try {
      const res = await UpdateTableStatusCustomer({
        tableId,
        status: "occupied",
      });
      if (res.success) {
        toast.success("Request bill cancelled. You can continue ordering.");
        router.refresh();
      } else {
        toast.error(res.message ?? "Failed to cancel request bill.");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsCancellingBill(false);
    }
  };

  const sessionElapsed = formatDuration(session.startedAt);

  const ORDER_ALLOWED_STATUSES: Array<typeof session.status> = [
    "seated",
    "ordering",
    "dining",
  ];
  const isSessionOrderable = ORDER_ALLOWED_STATUSES.includes(session.status);

  const isRequestBillActive = table.status === "request_bill";
  const isNeedAttentionActive = table.status === "need_attention";
  const orderingDisabled = !isSessionOrderable || isRequestBillActive;
  const isFinishedEating = session.status === "finishedEating";
  const isPaying = session.status === "paying";

  const allCategoryNames = useMemo(
    () => [ALL_CATEGORY, ...categories.map((c) => c.name)],
    [categories],
  );

  const menuItems: CustomerMenuItem[] = useMemo(() => {
    return categories.flatMap((cat) =>
      cat.items.map((it) => ({
        id: it.id,
        name: it.name,
        description: it.description ?? "",
        price: it.price,
        category: cat.name,
        categoryId: cat.id,
        imageUrl: it.imageUrl,
        emoji: pickEmoji(it.name, cat.name),
        status: it.status,
      })),
    );
  }, [categories]);

  const categoryCounts: Record<string, number> = useMemo(() => {
    const counts: Record<string, number> = {
      [ALL_CATEGORY]: menuItems.length,
    };
    categories.forEach((c) => {
      counts[c.name] = c.items.length;
    });
    return counts;
  }, [categories, menuItems.length]);

  const filtered = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat =
        activeCategory === ALL_CATEGORY || item.category === activeCategory;
      if (!matchCat) return false;
      if (search === "") return true;
      const needle = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(needle) ||
        (item.description && item.description.toLowerCase().includes(needle))
      );
    });
  }, [menuItems, activeCategory, search]);

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

  const handleCartClick = () => {
    router.push(`/table/${tableId}/cart`);
  };

  const handleMyOrdersClick = () => {
    router.push(`/table/${tableId}/orders`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <MenuHeader
        restaurant={restaurant}
        branch={branch}
        table={table}
        session={session}
        tableId={tableId}
        totalItems={totalItems}
        showBurger={showBurger}
        setShowBurger={setShowBurger}
        setShowLanguageModal={setShowLanguageModal}
        setShowScanModal={setShowScanModal}
        onCartClick={handleCartClick}
      />

      <AnimatePresence>
        {isNeedAttentionActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-rose-light border-b border-rose/20 px-5 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-rose">
                  Staff has been notified
                </p>
                <p className="text-[11px] text-rose/70 mt-0.5">
                  They will arrive at your table shortly
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRequestBillActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gold-light border-b border-[#9A6C10]/20 px-5 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#9A6C10] flex items-center justify-center shrink-0">
                <Receipt className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#9A6C10]">
                  Bill requested
                </p>
                <p className="text-[11px] text-[#9A6C10]/70 mt-0.5">
                  Staff is preparing your bill. Ordering is disabled.
                </p>
              </div>
              <button
                onClick={handleCancelRequestBill}
                disabled={isCancellingBill}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#9A6C10]/30 text-[12px] font-medium text-[#9A6C10] active:bg-[#9A6C10]/10 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isCancellingBill ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <X className="w-3.5 h-3.5" />
                )}
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isRequestBillActive && isFinishedEating && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-clay-light/60 border-b border-clay/20 px-5 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-clay flex items-center justify-center shrink-0">
                <Receipt className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-clay-dark">
                  Finished eating
                </p>
                <p className="text-[11px] text-clay-dark/70 mt-0.5">
                  Ordering is no longer available. Request your bill when ready.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isRequestBillActive && isPaying && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-cream-dark border-b border-black/8 px-5 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-text-primary/80 flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-text-primary">
                  Payment in progress
                </p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Ordering is disabled during payment. Contact staff if you need
                  help.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MenuSearchBar
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        search={search}
        setSearch={setSearch}
        activeCategory={activeCategory}
      />

      <CategoryTabs
        categories={allCategoryNames}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        categoryCounts={categoryCounts}
      />

      <MenuList
        menuItems={menuItems}
        filteredItems={filtered}
        getQty={getQty}
        addItem={addItem}
        removeItem={removeItem}
        disabled={orderingDisabled}
      />

      <CartFooter
        totalItems={totalItems}
        totalPrice={totalPrice}
        onCartClick={handleCartClick}
        orderingDisabled={orderingDisabled}
      />

      <AnimatePresence>
        {showBurger && (
          <BurgerSideMenu
            showBurger={showBurger}
            setShowBurger={setShowBurger}
            restaurant={restaurant}
            branch={branch}
            table={table}
            tableId={tableId}
            sessionElapsed={sessionElapsed}
            orderedItemCount={orderedItemCount}
            orderedTotal={orderedTotal}
            categoryNames={allCategoryNames}
            activeCategory={activeCategory}
            categoryCounts={categoryCounts}
            language={language}
            onCategoryChange={setActiveCategory}
            setShowLanguageModal={setShowLanguageModal}
            onMyOrdersClick={handleMyOrdersClick}
            hasOrders={orders.length > 0}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScanModal && (
          <ScanQrModal
            showScanModal={showScanModal}
            setShowScanModal={setShowScanModal}
            table={table}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLanguageModal && (
          <LanguageModal
            showLanguageModal={showLanguageModal}
            setShowLanguageModal={setShowLanguageModal}
            language={language}
            setLanguage={setLanguage}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
