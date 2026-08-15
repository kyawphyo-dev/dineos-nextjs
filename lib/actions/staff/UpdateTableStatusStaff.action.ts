"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { errorAction } from "@/lib/response";
import UpdateTableStatusSchema from "@/lib/schemas/UpdateTableStatusSchema";
import { authenticatedUser } from "@/app/types/admin";

interface UpdateTableStatusStaffParams {
  tableId: string;
  status: "need_attention" | "request_bill" | "occupied";
  branchId: string;
}

async function UpdateTableStatusStaff(params: UpdateTableStatusStaffParams) {
  const validate = UpdateTableStatusSchema.safeParse({
    tableId: params.tableId,
    status: params.status,
  });
  if (!validate.success) {
    throw new Error(validate.error.issues[0].message);
  }

  const { tableId, status } = validate.data;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { branchId: userBranchId } = session.user as authenticatedUser;
    if (!userBranchId || userBranchId !== params.branchId) {
      throw new Error("Not authorized for this branch");
    }

    const table = await prisma.table.findUnique({
      where: { id: tableId },
      select: { id: true, status: true, branchId: true },
    });

    if (!table) {
      throw new Error("Table not found");
    }

    if (table.branchId !== params.branchId) {
      throw new Error("Table does not belong to this branch");
    }

    if (
      status === "occupied" &&
      (table.status as unknown as string) !== "need_attention" &&
      (table.status as unknown as string) !== "request_bill"
    ) {
      throw new Error(
        "Can only revert table to occupied when it needs attention or has request bill",
      );
    }

    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { status: status as any },
      select: { id: true, status: true },
    });

    return {
      success: true,
      data: {
        table: JSON.parse(JSON.stringify(updatedTable)),
      },
      message:
        status === "occupied" &&
        (table.status as unknown as string) === "need_attention"
          ? "Customer need attention resolved."
          : status === "occupied" &&
              (table.status as unknown as string) === "request_bill"
            ? "Request bill cancelled."
            : "Table status updated.",
    };
  } catch (e) {
    return errorAction(e);
  }
}

export default UpdateTableStatusStaff;
