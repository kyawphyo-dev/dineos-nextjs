"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import {
  INITIAL_CATEGORIES,
  INITIAL_ADMIN_MENU_ITEMS,
  INITIAL_ADMIN_PACKAGES,
  INITIAL_ADMIN_TABLES,
} from "@/app/data/admin-mock";
import type { MenuCategory, AdminMenuItem, AdminPackage, AdminTable } from "@/app/types/admin";

interface CatalogContextValue {
  categories: MenuCategory[];
  menuItems: AdminMenuItem[];
  packages: AdminPackage[];
  tables: AdminTable[];
  addCategory: (name: string) => void;
  removeCategory: (id: string) => void;
  addMenuItem: (item: Omit<AdminMenuItem, "id">) => void;
  toggleMenuItemAvailable: (id: string) => void;
  removeMenuItem: (id: string) => void;
  addPackage: (pkg: Omit<AdminPackage, "id">) => void;
  removePackage: (id: string) => void;
  addTable: (table: Omit<AdminTable, never>) => void;
  removeTable: (id: string) => void;
}

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);

let categoryCounter = 100;
let menuItemCounter = 100;
let packageCounter = 100;

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<MenuCategory[]>(INITIAL_CATEGORIES);
  const [menuItems, setMenuItems] = useState<AdminMenuItem[]>(INITIAL_ADMIN_MENU_ITEMS);
  const [packages, setPackages] = useState<AdminPackage[]>(INITIAL_ADMIN_PACKAGES);
  const [tables, setTables] = useState<AdminTable[]>(INITIAL_ADMIN_TABLES);

  const addCategory = (name: string) => {
    setCategories((prev) => [...prev, { id: `c${categoryCounter++}`, name, itemCount: 0 }]);
  };

  const removeCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const addMenuItem = (item: Omit<AdminMenuItem, "id">) => {
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

  const addPackage = (pkg: Omit<AdminPackage, "id">) => {
    setPackages((prev) => [...prev, { ...pkg, id: `p${packageCounter++}` }]);
  };

  const removePackage = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  const addTable = (table: AdminTable) => {
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
