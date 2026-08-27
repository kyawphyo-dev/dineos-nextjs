"use server";

import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { errorAction } from "@/lib/response";
import { serializePrisma } from "@/lib/serializer";
import { getServerSession } from "next-auth";

const ACTIVE_DINING_STATUSES = [
  "seated",
  "ordering",
  "dining",
  "finishedEating",
  "paying",
] as const;

export type CashierLineItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
  orderId: string;
};

export type CashierSessionStatus = "dining" | "finished" | "billed";

export type CashierDiningSession = {
  sessionId: string;
  tableId: string;
  packageName: string;
  guestCount: number;
  seatedMinutesAgo: number;
  status: CashierSessionStatus;
  orderIds: string[];
  items: CashierLineItem[];
  billId: string | null;
  billReceiptNumber: string | null;
  billStatus: string | null;
  billGrandTotal: number | null;
  billSubtotal: number | null;
  billDiscount: number | null;
};

export type CashierSessionResult = {
  restaurant: {
    id: string;
    name: string;
  };
  branch: {
    id: string;
    name: string;
    location: string | null;
  };
  sessions: CashierDiningSession[];
};

function mapDiningStatusToCashier(status: string): CashierSessionStatus {
  switch (status) {
    case "finishedEating":
      return "finished";
    case "completed":
      return "billed";
    case "seated":
    case "ordering":
    case "dining":
    case "paying":
    default:
      return "dining";
  }
}

export default async function getCashierSession(): Promise<{
  success: boolean;
  data?: CashierSessionResult | null;
  message?: string;
  details?: object | null;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error("Not authenticated");
    }
    const { user } = session;
    if (!user.branchId) {
      throw new Error("Branch ID not found");
    }

    const branch = await prisma.branch.findUnique({
      where: { id: user.branchId },
      select: {
        id: true,
        name: true,
        location: true,
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
        tables: {
          orderBy: { tableNumber: "asc" },
          select: {
            id: true,
            tableNumber: true,
            diningSessions: {
              where: {
                status: { in: [...ACTIVE_DINING_STATUSES] },
              },
              orderBy: { startedAt: "desc" },
              take: 1,
              include: {
                package: {
                  select: {
                    name: true,
                  },
                },
                orders: {
                  where: {
                    status: { not: "cancelled" },
                  },
                  orderBy: { createdAt: "desc" },
                  include: {
                    items: {
                      include: {
                        menuItem: {
                          select: { name: true },
                        },
                      },
                    },
                  },
                },
                bill: {
                  select: {
                    id: true,
                    receiptNumber: true,
                    status: true,
                    grandTotal: true,
                    discount: true,
                    subtotal: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!branch) {
      return {
        success: true,
        data: null,
        message: "Branch not found",
      };
    }

    const now = new Date();
    const sessions: CashierDiningSession[] = [];

    for (const table of branch.tables) {
      const diningSession = table.diningSessions[0];
      if (!diningSession) continue;

      const orderIds: string[] = [];
      const items: CashierLineItem[] = [];

      for (const order of diningSession.orders) {
        orderIds.push(order.id);
        for (const orderItem of order.items) {
          items.push({
            id: orderItem.id,
            name: orderItem.menuItem.name,
            qty: orderItem.quantity,
            price: orderItem.price as unknown as number,
            orderId: order.id,
          });
        }
      }

      const startedAt = diningSession.startedAt;
      const seatedMinutesAgo = Math.max(
        0,
        Math.round((now.getTime() - startedAt.getTime()) / 60000),
      );

      sessions.push({
        sessionId: diningSession.id,
        tableId: table.tableNumber,
        packageName: diningSession.package?.name ?? "Walk-in",
        guestCount: diningSession.guestCount,
        seatedMinutesAgo,
        status: mapDiningStatusToCashier(diningSession.status),
        orderIds,
        items,
        billId: diningSession.bill?.id ?? null,
        billReceiptNumber: diningSession.bill?.receiptNumber ?? null,
        billStatus: diningSession.bill?.status ?? null,
        billGrandTotal: diningSession.bill?.grandTotal
          ? Number(diningSession.bill.grandTotal)
          : null,
        billSubtotal: diningSession.bill?.subtotal
          ? Number(diningSession.bill.subtotal)
          : null,
        billDiscount: diningSession.bill?.discount
          ? Number(diningSession.bill.discount)
          : null,
      });
    }

    const result: CashierSessionResult = {
      restaurant: {
        id: branch.restaurant.id,
        name: branch.restaurant.name,
      },
      branch: {
        id: branch.id,
        name: branch.name,
        location: branch.location,
      },
      sessions,
    };

    return {
      success: true,
      data: serializePrisma(result) as unknown as CashierSessionResult,
      message: "Cashier sessions retrieved successfully.",
    };
  } catch (e) {
    return errorAction(e);
  }
}
