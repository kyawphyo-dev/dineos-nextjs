"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { errorAction } from "@/lib/response";
import UpdateTableStatusSchema from "@/lib/schemas/UpdateTableStatusSchema";

export type TableStatus =
  | "available"
  | "reserved"
  | "occupied"
  | "need_attention"
  | "request_bill"
  | "cleaning"
  | "maintenance";

interface UpdateTableStatusCustomerParams {
  tableId: string;
  status: TableStatus;
}

async function UpdateTableStatusCustomer(
  params: UpdateTableStatusCustomerParams,
) {
  const validate = UpdateTableStatusSchema.safeParse(params);
  if (!validate.success) {
    throw new Error(validate.error.issues[0].message);
  }

  const { tableId, status } = validate.data;

  try {
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      select: { id: true, status: true },
    });

    if (!table) {
      throw new Error("Table not found");
    }

    if (
      status === "need_attention" &&
      table.status !== "occupied" &&
      (table.status as unknown as string) !== "request_bill"
    ) {
      throw new Error(
        "Can only call staff when table is occupied or bill requested",
      );
    }

    if (
      status === "request_bill" &&
      table.status !== "occupied" &&
      (table.status as unknown as string) !== "need_attention"
    ) {
      throw new Error("Can only request bill when table is occupied");
    }

    if (
      status === "occupied" &&
      (table.status as unknown as string) !== "need_attention" &&
      (table.status as unknown as string) !== "request_bill"
    ) {
      throw new Error(
        "Can only cancel when staff was called or bill was requested",
      );
    }

    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { status: status as any },
      select: { id: true, status: true },
    });

    revalidatePath("/(customer)/table/[id]", "layout");

    return {
      success: true,
      data: {
        table: JSON.parse(JSON.stringify(updatedTable)),
      },
      message:
        status === "need_attention"
          ? "Staff has been notified."
          : status === "request_bill"
            ? "Bill requested successfully."
            : (table.status as unknown as string) === "need_attention"
              ? "Call staff cancelled."
              : "Request bill cancelled.",
    };
  } catch (e) {
    return errorAction(e);
  }
}

export default UpdateTableStatusCustomer;
