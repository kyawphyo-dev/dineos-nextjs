"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { CartItem, CustomerMenuItem } from "@/app/types/customer";

interface CartContextValue {
  cart: CartItem[];
  totalItems: number;
  totalPrice: number;
  getQty: (id: string) => number;
  addItem: (item: CustomerMenuItem) => void;
  removeItem: (item: CustomerMenuItem) => void;
  setCart: (items: CartItem[]) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const getQty = (id: string) => cart.find((c) => c.id === id)?.qty ?? 0;

  const addItem = (item: CustomerMenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeItem = (item: CustomerMenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (!existing) return prev;
      if (existing.qty <= 1) return prev.filter((c) => c.id !== item.id);
      return prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty - 1 } : c));
    });
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, totalItems, totalPrice, getQty, addItem, removeItem, setCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
