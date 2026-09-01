"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { errorAction } from "@/lib/response";
import StartDiningSessionSchema from "@/lib/schemas/StartDiningSessionSchema";
import { authenticatedUser } from "@/app/types/admin";

interface StartDiningSessionParams {
  tableNumber: string;
  packageId?: string | null;
  guestCount: number;
  branchId: string;
}

const ACTIVE_DINING_STATUSES = [
  "seated",
  "ordering",
  "dining",
  "finishedEating",
  "paying",
] as const;

async function StartDiningSession(params: StartDiningSessionParams) {
  const validate = StartDiningSessionSchema.safeParse(params);
  if (!validate.success) {
    throw new Error(validate.error.issues[0].message);
  }
  const { tableNumber, packageId, guestCount, branchId } = validate.data;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    const { id: staffId } = session.user as authenticatedUser;

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

    const result = await prisma.$transaction(async (tx) => {
      const existingActiveSession = await tx.diningSession.findFirst({
        where: {
          tableId: table.id,
          status: { in: [...ACTIVE_DINING_STATUSES] },
        },
        orderBy: { startedAt: "desc" },
        select: { id: true, status: true },
      });

      if (existingActiveSession) {
        throw new Error(
          `Table ${tableNumber} already has an active dining session`,
        );
      }

      const updatedTable = await tx.table.update({
        where: { id: table.id },
        data: { status: "occupied" },
      });

      const diningSession = await tx.diningSession.create({
        data: {
          tableId: table.id,
          packageId,
          guestCount,
          startedById: staffId,
          status: "seated",
        },
      });

      return { updatedTable, diningSession };
    });

    return {
      success: true,
      data: {
        table: JSON.parse(JSON.stringify(result.updatedTable)),
        diningSession: JSON.parse(JSON.stringify(result.diningSession)),
      },
      message: "Dining session started successfully.",
    };
  } catch (e) {
    return errorAction(e);
  }
}

export default StartDiningSession;
