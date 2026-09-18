"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { errorAction } from "@/lib/response";
import { revalidatePath } from "next/cache";
import CloseCashierSessionSchema from "@/lib/schemas/CloseCashierSessionSchema";
import { authenticatedUser } from "@/app/types/admin";

interface CloseCashierSessionParams {
  tableNumber: string;
  branchId: string;
}

const PAYMENT_ACTIVE_STATUSES = [
  "seated",
  "ordering",
  "dining",
  "finishedEating",
  "paying",
] as const;

async function CloseCashierSession(params: CloseCashierSessionParams) {
  const validate = CloseCashierSessionSchema.safeParse(params);
  if (!validate.success) {
    throw new Error(validate.error.issues[0].message);
  }
  const { tableNumber, branchId } = validate.data;

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
        status: { in: [...PAYMENT_ACTIVE_STATUSES] },
      },
      orderBy: { startedAt: "desc" },
      include: {
        bill: {
          select: {
            id: true,
            status: true,
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

    if (activeSession.bill.status !== "paid") {
      throw new Error("Bill must be paid before closing the session");
    }

    const now = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.diningSession.update({
        where: { id: activeSession.id },
        data: {
          status: "completed",
          closedAt: now,
          closedById: cashierId,
          finishedAt: activeSession.finishedAt ?? now,
        },
      });

      await tx.table.update({
        where: { id: table.id },
        data: { status: "cleaning" },
      });
    });

    revalidatePath("/(cashier)", "layout");
    revalidatePath("/cashier");
    revalidatePath("/cashier/history");

    return {
      success: true,
      data: null,
      message: "Session closed successfully.",
    };
  } catch (e) {
    return errorAction(e);
  }
}

export default CloseCashierSession;
