"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { errorAction } from "@/lib/response";
import { revalidatePath } from "next/cache";

interface MarkFinishedEatingParams {
  tableNumber: string;
  branchId: string;
}

const ACTIVE_DINING_STATUSES = [
  "seated",
  "ordering",
  "dining",
  "paying",
] as const;

async function MarkFinishedEating(params: MarkFinishedEatingParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { tableNumber, branchId } = params;

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
    });

    if (!activeSession) {
      throw new Error("No active dining session found for this table");
    }

    const updatedSession = await prisma.diningSession.update({
      where: { id: activeSession.id },
      data: {
        status: "finishedEating",
        finishedAt: new Date(),
      },
    });

    revalidatePath("/(cashier)", "layout");
    revalidatePath("/cashier");

    return {
      success: true,
      data: {
        session: JSON.parse(JSON.stringify(updatedSession)),
      },
      message: "Session marked as finished eating.",
    };
  } catch (e) {
    return errorAction(e);
  }
}

export default MarkFinishedEating;
