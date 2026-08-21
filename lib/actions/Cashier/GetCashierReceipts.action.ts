"use server";

import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { errorAction } from "@/lib/response";
import { serializePrisma } from "@/lib/serializer";
import { getServerSession } from "next-auth";
import type {
  Discount,
  LineItem,
  PaymentMethod as UIPaymentMethod,
  ReceiptRecord,
} from "@/app/types/cashier";

function toLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mapPaymentMethodNameToUI(name: string): UIPaymentMethod {
  const lower = name.trim().toLowerCase();
  if (lower.includes("card") || lower.includes("credit") || lower.includes("debit")) return "card";
  if (lower.includes("qr") || lower.includes("prompt") || lower.includes("scan") || lower.includes("true")) return "qr";
  return "cash";
}

export type GetCashierReceiptsResult = {
  receipts: ReceiptRecord[];
};

export default async function getCashierReceipts(): Promise<{
  success: boolean;
  data?: GetCashierReceiptsResult | null;
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

    const branchBills = await prisma.bill.findMany({
      where: {
        diningSession: {
          table: {
            branchId: user.branchId,
          },
        },
        status: { in: ["paid", "partiallyPaid", "refunded"] },
        paidAt: { not: null },
      },
      orderBy: { paidAt: "desc" },
      include: {
        diningSession: {
          include: {
            table: {
              select: { tableNumber: true },
            },
            package: {
              select: { name: true },
            },
            orders: {
              where: { status: { not: "cancelled" } },
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
          },
        },
        payments: {
          where: { status: { in: ["paid", "refunded"] } },
          orderBy: { paidAt: "asc" },
          include: {
            paymentMethod: {
              select: { name: true },
            },
          },
        },
      },
    });

    const receipts: ReceiptRecord[] = branchBills.map((bill) => {
      const ds = bill.diningSession;
      const firstPayment = bill.payments[0];
      const uiMethod: UIPaymentMethod = firstPayment
        ? mapPaymentMethodNameToUI(firstPayment.paymentMethod.name)
        : "cash";

      const items: LineItem[] = [];
      const orderIds: string[] = [];
      for (const order of ds.orders) {
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

      const subtotal = Number(bill.subtotal);
      const discountRaw = Number(bill.discount);
      const grandTotal = Number(bill.grandTotal);

      let discount: Discount | null = null;
      let discountAmount = 0;

      if (discountRaw > 0) {
        const serviceCharge = Number(bill.serviceCharge ?? 0);
        const tax = Number(bill.tax ?? 0);
        const grossBeforeDiscount = grandTotal + discountRaw;
        const menuSubtotalPlusTaxes = subtotal + serviceCharge + tax;

        const looksLikePercent =
          subtotal > 0 &&
          Math.abs(Math.round(subtotal * (discountRaw / 100)) - discountRaw) <=
            Math.max(2, subtotal * 0.01) &&
          Math.abs(
            (menuSubtotalPlusTaxes - Math.round(subtotal * (discountRaw / 100))) -
              grossBeforeDiscount,
          ) <= Math.max(2, grossBeforeDiscount * 0.01);

        if (looksLikePercent) {
          discount = { type: "percent", value: Math.round(discountRaw) };
          discountAmount = Math.round(subtotal * (discountRaw / 100));
        } else {
          discount = { type: "fixed", value: discountRaw };
          discountAmount = discountRaw;
        }
      }

      const paidAtDate = bill.paidAt ?? new Date(bill.createdAt);

      const total = Math.max(0, subtotal - discountAmount);

      return {
        id: bill.receiptNumber,
        tableId: ds.table.tableNumber,
        packageName: ds.package?.name ?? "Walk-in",
        guestCount: ds.guestCount,
        orderIds,
        items,
        subtotal,
        discount,
        discountAmount,
        total: total > 0 ? total : grandTotal,
        method: uiMethod,
        paidAt: paidAtDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        paidDate: paidAtDate.toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        paidDateISO: toLocalISODate(paidAtDate),
      };
    });

    const result: GetCashierReceiptsResult = { receipts };

    return {
      success: true,
      data: serializePrisma(result) as unknown as GetCashierReceiptsResult,
      message: "Cashier receipts retrieved successfully.",
    };
  } catch (e) {
    return errorAction(e);
  }
}
