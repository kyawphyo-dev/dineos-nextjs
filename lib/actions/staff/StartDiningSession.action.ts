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

    // Find the table by tableNumber and branchId
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

    // Create the dining session and update table status in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update table status to occupied
      const updatedTable = await tx.table.update({
        where: { id: table.id },
        data: { status: "occupied" },
      });

      // Create the dining session
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
