"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { errorAction } from "@/lib/response";
import { authenticatedUser } from "@/app/types/admin";

interface CloseDiningSessionParams {
  sessionId: string;
  tableNumber: string;
  branchId: string;
}

async function CloseDiningSession(params: CloseDiningSessionParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    const { id: staffId } = session.user as authenticatedUser;

    // Find the table first
    const table = await prisma.table.findUnique({
      where: {
        branchId_tableNumber: {
          branchId: params.branchId,
          tableNumber: params.tableNumber,
        },
      },
    });

    if (!table) {
      throw new Error("Table not found");
    }

    // Update dining session and table status in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedSession = await tx.diningSession.update({
        where: { id: params.sessionId },
        data: {
          status: "completed",
          closedAt: new Date(),
          closedById: staffId,
        },
      });

      const updatedTable = await tx.table.update({
        where: { id: table.id },
        data: { status: "available" },
      });

      return { updatedSession, updatedTable };
    });

    return {
      success: true,
      data: {
        session: JSON.parse(JSON.stringify(result.updatedSession)),
        table: JSON.parse(JSON.stringify(result.updatedTable)),
      },
      message: "Session closed successfully.",
    };
  } catch (e) {
    return errorAction(e);
  }
}

export default CloseDiningSession;
