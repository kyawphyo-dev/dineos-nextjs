"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { errorAction } from "@/lib/response";
import { serializePrisma } from "@/lib/serializer";
import RequestBillCustomerSchema from "@/lib/schemas/RequestBillCustomerSchema";

const ACTIVE_DINING_STATUSES = [
  "seated",
  "ordering",
  "dining",
  "finishedEating",
  "paying",
] as const;

const REQUESTABLE_SESSION_STATUSES = [
  "seated",
  "ordering",
  "dining",
  "finishedEating",
] as const;

export type RequestBillCustomerResult = {
  table: {
    id: string;
    status: string;
  };
  session: {
    id: string;
    status: string;
  };
};

async function RequestBillCustomer(params: { tableId: string }) {
  const validate = RequestBillCustomerSchema.safeParse(params);
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

    const tableStatusStr = table.status as unknown as string;

    if (tableStatusStr === "request_bill") {
      return {
        success: false,
        message: "A bill request is already active for this table.",
        details: null,
      };
    }

    if (tableStatusStr !== "occupied" && tableStatusStr !== "need_attention") {
      return {
        success: false,
        message: "Can only request bill when table is occupied.",
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
        message: "No active dining session found for this table.",
        details: null,
      };
    }

    if (activeSession.bill) {
      return {
        success: false,
        message:
          "Cannot request bill — a bill has already been created. Please contact staff for assistance.",
        details: null,
      };
    }

    if (activeSession.status === "paying") {
      return {
        success: false,
        message:
          "Cannot request bill — payment is already in progress. Please wait for staff.",
        details: null,
      };
    }

    if (
      !REQUESTABLE_SESSION_STATUSES.includes(
        activeSession.status as (typeof REQUESTABLE_SESSION_STATUSES)[number],
      )
    ) {
      const statusLabel: Record<string, string> = {
        completed: "your dining has been completed",
        cancelled: "your session has been cancelled",
      };
      const reason = statusLabel[activeSession.status] ?? "this session stage";
      return {
        success: false,
        message: `Cannot request bill — ${reason}. Please contact staff if you need assistance.`,
        details: null,
      };
    }

    const sessionOrders = await prisma.order.findMany({
      where: { diningSessionId: activeSession.id },
      select: { id: true, status: true },
    });

    const activeOrders = sessionOrders.filter((o) => o.status !== "cancelled");

    if (activeOrders.length === 0) {
      return {
        success: false,
        message: "Cannot request bill — no orders have been placed yet.",
        details: null,
      };
    }

    const notServedOrders = activeOrders.filter(
      (o) => o.status !== "completed",
    );

    if (notServedOrders.length > 0) {
      return {
        success: false,
        message:
          "Cannot request bill — some orders are still being prepared or served. Please wait until all items have been served.",
        details: {
          notServedCount: notServedOrders.length,
          totalCount: activeOrders.length,
        },
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const sessionUpdate: Record<string, unknown> = {};
      if (activeSession.status !== "finishedEating") {
        sessionUpdate.status = "finishedEating";
        sessionUpdate.finishedAt = new Date();
      }

      const updatedSession =
        Object.keys(sessionUpdate).length > 0
          ? await tx.diningSession.update({
              where: { id: activeSession.id },
              data: sessionUpdate,
              select: { id: true, status: true },
            })
          : { id: activeSession.id, status: activeSession.status };

      const updatedTable = await tx.table.update({
        where: { id: tableId },
        data: { status: "request_bill" },
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
      data: serializePrisma(result) as RequestBillCustomerResult,
      message:
        "Bill requested successfully. Staff will come to your table shortly.",
    };
  } catch (e) {
    return errorAction(e);
  }
}

export default RequestBillCustomer;
