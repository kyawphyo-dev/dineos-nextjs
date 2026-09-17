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
  ReceiptPayment,
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
  if (
    lower.includes("card") ||
    lower.includes("credit") ||
    lower.includes("debit")
  )
    return "card";
  if (
    lower.includes("qr") ||
    lower.includes("prompt") ||
    lower.includes("scan") ||
    lower.includes("true")
  )
    return "qr";
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

    const branchInfo = await prisma.branch.findUnique({
      where: { id: user.branchId },
      select: {
        id: true,
        name: true,
        location: true,
        restaurant: { select: { id: true, name: true } },
      },
    });

    if (!branchInfo) {
      throw new Error("Branch not found");
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
      select: {
        receiptNumber: true,
        subtotal: true,
        discount: true,
        serviceChargeRate: true,
        serviceCharge: true,
        taxRate: true,
        tax: true,
        grandTotal: true,
        status: true,
        paidAt: true,
        createdAt: true,
        diningSession: {
          select: {
            guestCount: true,
            package: { select: { name: true } },
            table: { select: { tableNumber: true } },
            orders: {
              where: { status: { not: "cancelled" } },
              select: {
                id: true,
                items: {
                  select: {
                    id: true,
                    quantity: true,
                    price: true,
                    orderId: true,
                    menuItem: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
        payments: {
          where: { status: { in: ["paid", "refunded"] } },
          orderBy: { paidAt: "asc" },
          select: {
            grandTotal: true,
            receivedAmount: true,
            changeAmount: true,
            referenceNo: true,
            paidAt: true,
            paymentMethod: { select: { name: true } },
            cashier: { select: { name: true } },
          },
        },
      },
    });

    const receipts: ReceiptRecord[] = branchBills
      .filter((bill) => bill.diningSession && bill.diningSession.table)
      .map((bill) => {
        const ds = bill.diningSession!;
        const firstPayment = bill.payments[0];
        const firstMethodName = firstPayment?.paymentMethod?.name;
        const uiMethod: UIPaymentMethod = firstMethodName
          ? mapPaymentMethodNameToUI(firstMethodName)
          : "cash";

        const items: LineItem[] = [];
        const orderIds: string[] = [];
        for (const order of ds.orders ?? []) {
          orderIds.push(order.id);
          for (const orderItem of order.items ?? []) {
            items.push({
              id: orderItem.id,
              name: orderItem.menuItem.name,
              qty: orderItem.quantity,
              price: orderItem.price as unknown as number,
              orderId: orderItem.orderId,
            });
          }
        }

        const subtotal = Number(bill.subtotal);
        const discountRaw = Number(bill.discount);
        const serviceChargeRate = Number(bill.serviceChargeRate ?? 5);
        const serviceCharge = Number(bill.serviceCharge ?? 0);
        const taxRate = Number(bill.taxRate ?? 7);
        const tax = Number(bill.tax ?? 0);
        const grandTotal = Number(bill.grandTotal);

        const billAny = bill as unknown as {
          discountType?: "percent" | "fixed" | null;
          discountValue?: number | null;
        };
        const storedDiscountType =
          billAny.discountType === "percent" || billAny.discountType === "fixed"
            ? billAny.discountType
            : null;
        const storedDiscountValue =
          billAny.discountValue != null ? Number(billAny.discountValue) : null;

        let discount: Discount | null = null;
        let discountAmount = 0;

        if (discountRaw > 0) {
          if (storedDiscountType && storedDiscountValue != null) {
            discount = { type: storedDiscountType, value: storedDiscountValue };
            discountAmount = discountRaw;
          } else {
            const grossBeforeDiscount = grandTotal + discountRaw;
            const menuSubtotalPlusTaxes = subtotal + serviceCharge + tax;

            const looksLikePercent =
              subtotal > 0 &&
              Math.abs(
                Math.round(subtotal * (discountRaw / 100)) - discountRaw,
              ) <= Math.max(2, subtotal * 0.01) &&
              Math.abs(
                menuSubtotalPlusTaxes -
                  Math.round(subtotal * (discountRaw / 100)) -
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
        }

        const payments: ReceiptPayment[] = bill.payments.map((p) => {
          const received = p.receivedAmount
            ? Number(p.receivedAmount)
            : Number(p.grandTotal);
          const change = p.changeAmount ? Number(p.changeAmount) : 0;
          return {
            method: mapPaymentMethodNameToUI(p.paymentMethod.name),
            amount: received - change,
            receivedAmount: received,
            changeAmount: change,
            referenceNo: p.referenceNo ?? undefined,
          };
        });

        const paidAtDate = bill.paidAt ?? new Date(bill.createdAt);

        return {
          id: bill.receiptNumber,
          restaurantName: branchInfo.restaurant.name,
          branchName: branchInfo.name,
          branchLocation: branchInfo.location,
          tableId: ds.table!.tableNumber,
          packageName: ds.package?.name ?? "Walk-in",
          guestCount: ds.guestCount,
          orderIds,
          items,
          subtotal,
          discount,
          discountAmount,
          serviceChargeRate,
          serviceCharge,
          taxRate,
          tax,
          grandTotal,
          total: grandTotal,
          method: uiMethod,
          payments,
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
          cashierName: firstPayment?.cashier?.name ?? undefined,
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
