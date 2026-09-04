"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { errorAction } from "@/lib/response";
import { serializePrisma } from "@/lib/serializer";
import { revalidatePath } from "next/cache";
import { MarkTableCleaningStaffSchema } from "@/lib/schemas/TableCleaningSchema";
import { authenticatedUser } from "@/app/types/admin";

export type MarkTableCleaningStaffResult = {
  table: {
    id: string;
    tableNumber: string;
    status: string;
  };
};

async function MarkTableCleaningStaff(params: {
  tableNumber: string;
  branchId: string;
}) {
  const validate = MarkTableCleaningStaffSchema.safeParse(params);
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
        "Cannot mark as cleaning — no bill request is active for this table.",
      );
    }

    const updatedTable = await prisma.table.update({
      where: { id: table.id },
      data: { status: "cleaning" },
      select: { id: true, tableNumber: true, status: true },
    });

    revalidatePath("/(cashier)", "layout");
    revalidatePath("/cashier");

    return {
      success: true,
      data: serializePrisma({
        table: updatedTable,
      }) as MarkTableCleaningStaffResult,
      message: "Table has been marked for cleaning.",
    };
  } catch (e) {
    return errorAction(e);
  }
}

export default MarkTableCleaningStaff;
