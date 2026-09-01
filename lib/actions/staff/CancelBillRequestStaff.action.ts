"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { errorAction } from "@/lib/response";
import { serializePrisma } from "@/lib/serializer";
import { revalidatePath } from "next/cache";
import { CancelBillRequestStaffSchema } from "@/lib/schemas/CancelBillRequestSchema";
import { authenticatedUser } from "@/app/types/admin";

const ACTIVE_DINING_STATUSES = [
  "seated",
  "ordering",
  "dining",
  "finishedEating",
  "paying",
] as const;

export type CancelBillRequestStaffResult = {
  table: {
    id: string;
    tableNumber: string;
    status: string;
  };
  session: {
    id: string;
    status: string;
  };
};

async function CancelBillRequestStaff(params: {
  tableNumber: string;
  branchId: string;
}) {
  const validate = CancelBillRequestStaffSchema.safeParse(params);
  if (!validate.success) {
    return errorAction(validate.error);
  }

  const { tableNumber, branchId } = validate.data;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { branchId: userBranchId } = session.user as authenticatedUser;
    if (!userBranchId || userBranchId !== branchId) {
      throw new Error("Not authorized for this branch");
    }

    const table = await prisma.table.findUnique({
      where: {
        branchId_tableNumber: {
          branchId,
          tableNumber,
        },
      },
      select: { id: true, status: true, tableNumber: true, branchId: true },
    });

    if (!table) {
      throw new Error("Table not found");
    }

    if (table.branchId !== branchId) {
      throw new Error("Table does not belong to this branch");
    }

    if ((table.status as unknown as string) !== "request_bill") {
      throw new Error(
        "Cannot cancel bill request — no bill request is active for this table.",
      );
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
      throw new Error("No active dining session found for this table");
    }

    if (activeSession.bill) {
      throw new Error(
        "Cannot cancel bill request — a bill has already been created for this session.",
      );
    }

    if (
      activeSession.status === "paying" ||
      activeSession.status === "completed" ||
      activeSession.status === "cancelled"
    ) {
      const statusLabel: Record<string, string> = {
        paying: "payment is already in progress",
        completed: "the dining session has been completed",
        cancelled: "the dining session has been cancelled",
      };
      const reason =
        statusLabel[activeSession.status] ?? "this session stage";
      throw new Error(
        `Cannot cancel bill request — ${reason}.`,
      );
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
        where: { id: table.id },
        data: { status: "occupied" },
        select: { id: true, tableNumber: true, status: true },
      });

      return {
        table: updatedTable,
        session: updatedSession,
      };
    });

    revalidatePath("/(cashier)", "layout");
    revalidatePath("/cashier");

    return {
      success: true,
      data: serializePrisma(result) as CancelBillRequestStaffResult,
      message: "Request bill cancelled. Table has been returned to occupied.",
    };
  } catch (e) {
    return errorAction(e);
  }
}

export default CancelBillRequestStaff;
