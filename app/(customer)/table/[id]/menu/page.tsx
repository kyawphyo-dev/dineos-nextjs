"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
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
  LANGUAGES,
  type LanguageCode,
} from "@/components/customer/customerMenu.utils";

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

  const sessionElapsed = formatDuration(session.startedAt);

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
      />

      <CartFooter
        totalItems={totalItems}
        totalPrice={totalPrice}
        onCartClick={handleCartClick}
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
