"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { errorAction } from "@/lib/response";
import { serializePrisma } from "@/lib/serializer";
import { revalidatePath } from "next/cache";
import RecordPaymentSchema from "@/lib/schemas/RecordPaymentSchema";
import { authenticatedUser } from "@/app/types/admin";
import type {
  PaymentMethod as UIPaymentMethod,
  ReceiptRecord,
  LineItem,
  Discount,
  ReceiptPayment,
} from "@/app/types/cashier";

type PaymentSplitInput = {
  method: UIPaymentMethod;
  amount: number;
  receivedAmount?: number;
  referenceNo?: string;
};

interface RecordPaymentParams {
  tableNumber: string;
  branchId: string;
  payments: PaymentSplitInput[];
}

const ACTIVE_DINING_STATUSES = [
  "seated",
  "ordering",
  "dining",
  "finishedEating",
  "paying",
] as const;

const UI_PAYMENT_METHOD_PATTERNS: Array<{
  ui: UIPaymentMethod;
  keywords: string[];
}> = [
  { ui: "card", keywords: ["card", "credit", "debit"] },
  { ui: "qr", keywords: ["qr", "prompt", "scan", "true"] },
  { ui: "cash", keywords: ["cash"] },
];

function mapPaymentMethodNameToUI(name: string): UIPaymentMethod {
  const lower = name.trim().toLowerCase();
  for (const mapping of UI_PAYMENT_METHOD_PATTERNS) {
    if (mapping.keywords.some((k) => lower.includes(k))) {
      return mapping.ui;
    }
  }
  return "cash";
}

async function resolvePaymentMethodId(
  branchId: string,
  uiMethod: UIPaymentMethod,
): Promise<string> {
  const allMethods = await prisma.paymentMethod.findMany({
    where: { branchId },
    select: { id: true, name: true },
  });

  const exact = allMethods.find(
    (m) => mapPaymentMethodNameToUI(m.name) === uiMethod,
  );
  if (exact) return exact.id;

  const created = await prisma.paymentMethod.create({
    data: {
      name:
        uiMethod === "card" ? "Card" : uiMethod === "qr" ? "QR Pay" : "Cash",
      branchId,
    },
    select: { id: true },
  });
  return created.id;
}

function toLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export type RecordPaymentResult = {
  receipt: ReceiptRecord;
};

async function RecordPayment(params: RecordPaymentParams) {
  const validate = RecordPaymentSchema.safeParse(params);
  if (!validate.success) {
    throw new Error(validate.error.issues[0].message);
  }
  const { tableNumber, branchId, payments } = validate.data;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    const { id: cashierId, name: cashierName } =
      session.user as authenticatedUser;

    const branchInfo = await prisma.branch.findUnique({
      where: { id: branchId },
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

    const table = await prisma.table.findUnique({
      where: {
        branchId_tableNumber: {
          branchId,
          tableNumber,
        },
      },
    });

    if (!table) {
      throw new Error("Table not found");
    }

    const activeSession = await prisma.diningSession.findFirst({
      where: {
        tableId: table.id,
        status: { in: [...ACTIVE_DINING_STATUSES] },
      },
      orderBy: { startedAt: "desc" },
      include: {
        package: { select: { name: true } },
        orders: {
          where: { status: { not: "cancelled" } },
          orderBy: { createdAt: "desc" },
          include: {
            items: {
              include: { menuItem: { select: { name: true } } },
            },
          },
        },
        bill: {
          select: {
            id: true,
            subtotal: true,
            discount: true,
            serviceChargeRate: true,
            serviceCharge: true,
            taxRate: true,
            tax: true,
            grandTotal: true,
            receiptNumber: true,
          },
        },
      },
    });

    if (!activeSession) {
      throw new Error("No active dining session found for this table");
    }

    if (!activeSession.bill) {
      throw new Error("No bill found for this session. Create bill first.");
    }

    if (activeSession.bill.status === "paid") {
      throw new Error("This bill has already been paid.");
    }

    const billTotal = Number(activeSession.bill.grandTotal);
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    if (Math.abs(totalPaid - billTotal) > 0.001) {
      throw new Error(
        `Total payments (฿${totalPaid.toLocaleString()}) must equal bill total (฿${billTotal.toLocaleString()})`,
      );
    }

    for (const split of payments) {
      if (split.method === "cash") {
        const received = split.receivedAmount ?? split.amount;
        if (received < split.amount - 0.001) {
          throw new Error(
            `Cash received (฿${received.toLocaleString()}) must be at least the charged amount (฿${Number(
              split.amount,
            ).toLocaleString()})`,
          );
        }
      }
    }

    const methodIdsByUI: Record<UIPaymentMethod, string> = {
      cash: await resolvePaymentMethodId(branchId, "cash"),
      card: await resolvePaymentMethodId(branchId, "card"),
      qr: await resolvePaymentMethodId(branchId, "qr"),
    };

    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();

      const paymentRows = await Promise.all(
        payments.map(async (split, idx) => {
          const chargedAmount = Number(split.amount);
          const receivedAmount = Number(split.receivedAmount ?? split.amount);
          const changeAmount = Math.max(0, receivedAmount - chargedAmount);

          return tx.payment.create({
            data: {
              billId: activeSession!.bill!.id,
              paymentMethodId: methodIdsByUI[split.method],
              grandTotal: billTotal,
              receivedAmount,
              changeAmount,
              paidAt: now,
              status: "paid",
              referenceNo:
                split.referenceNo ??
                (split.method === "qr" || split.method === "card"
                  ? `DEMO-${now.getTime()}-${idx + 1}`
                  : undefined),
              cashierId,
            },
            select: {
              id: true,
              grandTotal: true,
              receivedAmount: true,
              changeAmount: true,
              referenceNo: true,
              paidAt: true,
              status: true,
              paymentMethod: { select: { id: true, name: true } },
            },
          });
        }),
      );

      const updatedBill = await tx.bill.update({
        where: { id: activeSession!.bill!.id },
        data: {
          status: "paid",
          paidAt: now,
        },
        select: {
          id: true,
          receiptNumber: true,
          subtotal: true,
          discount: true,
          serviceChargeRate: true,
          serviceCharge: true,
          taxRate: true,
          tax: true,
          grandTotal: true,
          paidAt: true,
        },
      });

      await tx.diningSession.update({
        where: { id: activeSession!.id },
        data: {
          status: "paying",
          finishedAt: activeSession!.finishedAt ?? now,
        },
      });

      return {
        updatedBill,
        paymentRows,
      };
    });

    const orderIds: string[] = [];
    const items: LineItem[] = [];
    for (const order of activeSession.orders) {
      orderIds.push(order.id);
      for (const orderItem of order.items) {
        items.push({
          id: orderItem.id,
          name: orderItem.menuItem.name,
          qty: orderItem.quantity,
          price: Number(orderItem.price),
          orderId: order.id,
        });
      }
    }

    const subtotal = Number(result.updatedBill.subtotal);
    const discountRaw = Number(result.updatedBill.discount);
    const serviceChargeRate = Number(result.updatedBill.serviceChargeRate);
    const serviceCharge = Number(result.updatedBill.serviceCharge);
    const taxRate = Number(result.updatedBill.taxRate);
    const tax = Number(result.updatedBill.tax);
    const grandTotal = Number(result.updatedBill.grandTotal);

    let discount: Discount | null = null;
    let discountAmount = 0;

    if (discountRaw > 0) {
      const grossBeforeDiscount = grandTotal + discountRaw;
      const menuSubtotalPlusTaxes = subtotal + serviceCharge + tax;

      const looksLikePercent =
        subtotal > 0 &&
        Math.abs(Math.round(subtotal * (discountRaw / 100)) - discountRaw) <=
          Math.max(2, subtotal * 0.01) &&
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

    const firstPaymentMethodName = result.paymentRows[0]?.paymentMethod.name;
    const uiMethod: UIPaymentMethod = firstPaymentMethodName
      ? mapPaymentMethodNameToUI(firstPaymentMethodName)
      : "cash";

    const receiptPayments: ReceiptPayment[] = result.paymentRows.map((row) => {
      const received = Number(row.receivedAmount);
      const change = Number(row.changeAmount);
      return {
        method: mapPaymentMethodNameToUI(row.paymentMethod.name),
        amount: received - change,
        receivedAmount: received,
        changeAmount: change,
        referenceNo: row.referenceNo ?? undefined,
      };
    });

    const paidAtDate =
      result.updatedBill.paidAt ?? new Date(result.updatedBill.id);

    const receipt: ReceiptRecord = {
      id: result.updatedBill.receiptNumber,
      restaurantName: branchInfo.restaurant.name,
      branchName: branchInfo.name,
      branchLocation: branchInfo.location,
      tableId: tableNumber,
      packageName: activeSession.package?.name ?? "Walk-in",
      guestCount: activeSession.guestCount,
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
      payments: receiptPayments,
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
      cashierName: cashierName ?? undefined,
    };

    revalidatePath("/(cashier)", "layout");
    revalidatePath("/cashier");
    revalidatePath("/cashier/history");

    return {
      success: true,
      data: serializePrisma({ receipt }) as unknown as RecordPaymentResult,
      message: "Payment recorded successfully.",
    };
  } catch (e) {
    return errorAction(e);
  }
}

export default RecordPayment;
