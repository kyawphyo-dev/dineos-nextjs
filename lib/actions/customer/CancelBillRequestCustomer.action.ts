"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { errorAction } from "@/lib/response";
import { serializePrisma } from "@/lib/serializer";
import { CancelBillRequestCustomerSchema } from "@/lib/schemas/CancelBillRequestSchema";

const ACTIVE_DINING_STATUSES = [
  "seated",
  "ordering",
  "dining",
  "finishedEating",
  "paying",
] as const;

export type CancelBillRequestCustomerResult = {
  table: {
    id: string;
    status: string;
  };
  session: {
    id: string;
    status: string;
  };
};

async function CancelBillRequestCustomer(params: { tableId: string }) {
  const validate = CancelBillRequestCustomerSchema.safeParse(params);
  if (!validate.success) {
    return errorAction(validate.error);
  }

  const { tableId } = validate.data;

  try {
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      select: { id: true, status: true },
    });

    if (!table) {
      return {
        success: false,
        message: "Table not found",
        details: null,
      };
    }

    if ((table.status as unknown as string) !== "request_bill") {
      return {
        success: false,
        message:
          "Cannot cancel bill request — no bill request is active for this table.",
        details: null,
      };
    }

    const activeSession = await prisma.diningSession.findFirst({
      where: {
        tableId: table.id,
        status: { in: [...ACTIVE_DINING_STATUSES] },
      },
      orderBy: { startedAt: "desc" },
      include: {
        bill: {
          select: { id: true, status: true },
        },
      },
    });

    if (!activeSession) {
      return {
        success: false,
        message: "No active dining session found for this table",
        details: null,
      };
    }

    if (activeSession.bill) {
      return {
        success: false,
        message:
          "Cannot cancel bill request — a bill has already been created. Please contact staff for assistance.",
        details: null,
      };
    }

    if (activeSession.status !== "finishedEating") {
      const statusLabel: Record<string, string> = {
        seated: "you are still in the dining session",
        ordering: "ordering is still in progress",
        dining: "your dining is still in progress",
        paying: "payment is already in progress",
        completed: "your dining has been completed",
        cancelled: "your session has been cancelled",
      };
      const reason = statusLabel[activeSession.status] ?? "this session stage";
      return {
        success: false,
        message: `Cannot cancel bill request — ${reason}. Please contact staff if you need assistance.`,
        details: null,
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      let sessionUpdate: Record<string, unknown> = {};
      if (activeSession.status === "finishedEating") {
        sessionUpdate = {
          status: "seated",
          finishedAt: null,
        };
      }

      const updatedSession = sessionUpdate.status
        ? await tx.diningSession.update({
            where: { id: activeSession.id },
            data: sessionUpdate,
            select: { id: true, status: true },
          })
        : { id: activeSession.id, status: activeSession.status };

      const updatedTable = await tx.table.update({
        where: { id: tableId },
        data: { status: "occupied" },
        select: { id: true, status: true },
      });

      return {
        table: updatedTable,
        session: updatedSession,
      };
    });

    revalidatePath("/(customer)/table/[id]", "layout");

    return {
      success: true,
      data: serializePrisma(result) as CancelBillRequestCustomerResult,
      message: "Request bill cancelled. You can continue ordering.",
    };
  } catch (e) {
    return errorAction(e);
  }
}

export default CancelBillRequestCustomer;
