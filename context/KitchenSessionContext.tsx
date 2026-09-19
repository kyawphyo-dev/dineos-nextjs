"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import type { Ticket, TicketStatus } from "@/app/types/kitchen";
import type {
  KitchenSessionResult,
  KitchenMenu,
  KitchenCategory,
} from "@/lib/actions/Kitchen/GetKitchenSession.action";
import UpdateKitchenOrderStatus from "@/lib/actions/Kitchen/UpdateKitchenOrderStatus.action";
import { mapTicketStatusToOrderStatus } from "@/lib/kitchen-mapping";

interface KitchenSessionContextValue extends KitchenSessionResult {
  menus: KitchenMenu[];
  categories: KitchenCategory[];
  tickets: Ticket[];
  getTicket: (ticketId: string) => Ticket | undefined;
  advanceStatus: (ticketId: string, nextStatus: TicketStatus) => Promise<void>;
  refreshData: () => void;
}

const STATUS_FLOW: Record<TicketStatus, TicketStatus | null> = {
  new: "preparing",
  preparing: "ready",
  ready: "served",
  served: null,
};

const KitchenSessionContext = createContext<
  KitchenSessionContextValue | undefined
>(undefined);

export default function KitchenSessionProvider({
  value,
  children,
}: {
  value: KitchenSessionResult;
  children: ReactNode;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [tickets, setTickets] = useState<Ticket[]>(value.tickets);
  const [ticketsPropSnapshot, setTicketsPropSnapshot] = useState(value.tickets);
  const [menus, setMenus] = useState<KitchenMenu[]>(value.menus);
  const [menusSnapshot, setMenusSnapshot] = useState(value.menus);
  const [categories, setCategories] = useState<KitchenCategory[]>(
    value.categories,
  );
  const [categoriesSnapshot, setCategoriesSnapshot] = useState(
    value.categories,
  );

  if (value.tickets !== ticketsPropSnapshot) {
    setTickets((prevLocal) => {
      const incomingIds = new Set(value.tickets.map((t) => t.id));
      const localServedStale = prevLocal.filter(
        (localTicket) =>
          localTicket.status === "served" && !incomingIds.has(localTicket.id),
      );
      return [...value.tickets, ...localServedStale];
    });
    setTicketsPropSnapshot(value.tickets);
  }

  if (value.menus !== menusSnapshot) {
    setMenus(value.menus);
    setMenusSnapshot(value.menus);
  }

  if (value.categories !== categoriesSnapshot) {
    setCategories(value.categories);
    setCategoriesSnapshot(value.categories);
  }

  const getTicket = (ticketId: string) =>
    tickets.find((t) => t.id === ticketId);

  const advanceStatus = async (ticketId: string, nextStatus: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: nextStatus } : t)),
    );

    const orderStatus = mapTicketStatusToOrderStatus(nextStatus);
    await UpdateKitchenOrderStatus({ orderId: ticketId, status: orderStatus });

    startTransition(() => {
      router.refresh();
    });
  };

  const refreshData = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <KitchenSessionContext.Provider
      value={{
        restaurant: value.restaurant,
        branch: value.branch,
        menus,
        categories,
        tickets,
        getTicket,
        advanceStatus,
        refreshData,
      }}
    >
      {children}
    </KitchenSessionContext.Provider>
  );
}

export function useKitchenSession() {
  const ctx = useContext(KitchenSessionContext);
  if (!ctx)
    throw new Error(
      "useKitchenSession must be used within a KitchenSessionProvider",
    );
  return ctx;
}

export function useTickets(): {
  tickets: Ticket[];
  advanceStatus: (ticketId: string, nextStatus: TicketStatus) => Promise<void>;
} {
  const ctx = useKitchenSession();
  return {
    tickets: ctx.tickets,
    advanceStatus: ctx.advanceStatus,
  };
}

export function getNextStatus(current: TicketStatus): TicketStatus | null {
  return STATUS_FLOW[current];
}
