"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { errorAction } from "@/lib/response";
import { serializePrisma } from "@/lib/serializer";
import { revalidatePath } from "next/cache";
import CreateBillSchema from "@/lib/schemas/CreateBillSchema";
import { authenticatedUser } from "@/app/types/admin";

interface CreateBillParams {
  tableNumber: string;
  branchId: string;
  subtotal: number;
  discount: number;
}

const ACTIVE_DINING_STATUSES = [
  "seated",
  "ordering",
  "dining",
  "finishedEating",
  "paying",
] as const;

export type CreatedBillResult = {
  id: string;
  receiptNumber: string;
  sessionId: string;
  subtotal: number;
  discount: number;
  serviceChargeRate: number;
  serviceCharge: number;
  taxRate: number;
  tax: number;
  grandTotal: number;
  status: string;
};

async function generateReceiptNumber(branchId: string): Promise<string> {
  const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const branchPrefix = branchId.slice(0, 3).toUpperCase();
  const lastBill = await prisma.bill.findFirst({
    where: {
      receiptNumber: {
        startsWith: `${branchPrefix}-${datePrefix}-`,
      },
    },
    orderBy: { receiptNumber: "desc" },
    select: { receiptNumber: true },
  });

  let sequence = 1;
  if (lastBill) {
    const parts = lastBill.receiptNumber.split("-");
    const seqNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(seqNum)) {
      sequence = seqNum + 1;
    }
  }

  return `${branchPrefix}-${datePrefix}-${String(sequence).padStart(5, "0")}`;
}

async function CreateBill(params: CreateBillParams) {
  const validate = CreateBillSchema.safeParse(params);
  if (!validate.success) {
    throw new Error(validate.error.issues[0].message);
  }
  const { tableNumber, branchId, subtotal, discount } = validate.data;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    const { id: cashierId } = session.user as authenticatedUser;

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
        bill: true,
      },
    });

    if (!activeSession) {
      throw new Error("No active dining session found for this table");
    }

    if (activeSession.bill) {
      throw new Error("A bill already exists for this dining session");
    }

    const serviceChargeRate = 5;
    const taxRate = 7;
    const afterDiscount = Math.max(0, subtotal - discount);
    const serviceCharge = Math.round(afterDiscount * (serviceChargeRate / 100));
    const afterService = afterDiscount + serviceCharge;
    const tax = Math.round(afterService * (taxRate / 100));
    const grandTotal = afterService + tax;

    const result = await prisma.$transaction(async (tx) => {
      const receiptNumber = await generateReceiptNumber(branchId);

      const bill = await tx.bill.create({
        data: {
          sessionId: activeSession.id,
          subtotal,
          discount,
          serviceChargeRate,
          serviceCharge,
          taxRate,
          tax,
          grandTotal,
          status: "unpaid",
          receiptNumber,
        },
        select: {
          id: true,
          receiptNumber: true,
          sessionId: true,
          subtotal: true,
          discount: true,
          serviceChargeRate: true,
          serviceCharge: true,
          taxRate: true,
          tax: true,
          grandTotal: true,
          status: true,
        },
      });

      await tx.diningSession.update({
        where: { id: activeSession.id },
        data: { status: "paying" },
      });

      return bill;
    });

    revalidatePath("/(cashier)", "layout");
    revalidatePath("/cashier");

    return {
      success: true,
      data: serializePrisma(result) as unknown as CreatedBillResult,
      message: "Bill created successfully.",
    };
  } catch (e) {
    return errorAction(e);
  }
}

export default CreateBill;
