"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { MOCK_ORDERS } from "@/app/customers/data/mock";
import type { CartItem, Order } from "@/app/customers/types";

interface OrdersContextValue {
  orders: Order[];
  placeOrder: (items: CartItem[]) => void;
}

const OrdersContext = createContext<OrdersContextValue | undefined>(undefined);

let orderCounter = 1033;

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

  const placeOrder = (items: CartItem[]) => {
    if (items.length === 0) return;
    const newOrder: Order = {
      id: String(orderCounter++),
      status: "received",
      placedAt: "Just now",
      estimatedMin: 12,
      items: items.map((c) => ({ name: c.name, qty: c.qty, price: c.price })),
    };
    setOrders((prev) => [...prev, newOrder]);
  };

  return (
    <OrdersContext.Provider value={{ orders, placeOrder }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within an OrdersProvider");
  return ctx;
}
