"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import {
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_PACKAGES,
  INITIAL_TABLES,
} from "@/app/admin/data/mock";
import type { MenuCategory, MenuItem, Package, RestaurantTable } from "@/app/admin/types";

interface CatalogContextValue {
  categories: MenuCategory[];
  menuItems: MenuItem[];
  packages: Package[];
  tables: RestaurantTable[];
  addCategory: (name: string) => void;
  removeCategory: (id: string) => void;
  addMenuItem: (item: Omit<MenuItem, "id">) => void;
  toggleMenuItemAvailable: (id: string) => void;
  removeMenuItem: (id: string) => void;
  addPackage: (pkg: Omit<Package, "id">) => void;
  removePackage: (id: string) => void;
  addTable: (table: Omit<RestaurantTable, never>) => void;
  removeTable: (id: string) => void;
}

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);

let categoryCounter = 100;
let menuItemCounter = 100;
let packageCounter = 100;

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<MenuCategory[]>(INITIAL_CATEGORIES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [packages, setPackages] = useState<Package[]>(INITIAL_PACKAGES);
  const [tables, setTables] = useState<RestaurantTable[]>(INITIAL_TABLES);

  const addCategory = (name: string) => {
    setCategories((prev) => [...prev, { id: `c${categoryCounter++}`, name, itemCount: 0 }]);
  };

  const removeCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const addMenuItem = (item: Omit<MenuItem, "id">) => {
    setMenuItems((prev) => [...prev, { ...item, id: `m${menuItemCounter++}` }]);
  };

  const toggleMenuItemAvailable = (id: string) => {
    setMenuItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, available: !m.available } : m))
    );
  };

  const removeMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
  };

  const addPackage = (pkg: Omit<Package, "id">) => {
    setPackages((prev) => [...prev, { ...pkg, id: `p${packageCounter++}` }]);
  };

  const removePackage = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  const addTable = (table: RestaurantTable) => {
    setTables((prev) => [...prev, table]);
  };

  const removeTable = (id: string) => {
    setTables((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <CatalogContext.Provider
      value={{
        categories,
        menuItems,
        packages,
        tables,
        addCategory,
        removeCategory,
        addMenuItem,
        toggleMenuItemAvailable,
        removeMenuItem,
        addPackage,
        removePackage,
        addTable,
        removeTable,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within a CatalogProvider");
  return ctx;
}
