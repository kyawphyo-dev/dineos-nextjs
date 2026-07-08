"use server";

import { getServerSession } from "next-auth";
import CreateTableSchema from "../schemas/CreateTableSchema";
import { authOptions } from "../auth-options";
import { errorAction } from "../response";
import { prisma } from "../prisma";
import { Table } from "@/app/types/restaurant";

interface CreateTableParams {
  tableNumber: string;
  capacity: number;
  zoneId: string;
  branchId: string;
  qr?: string | null;
}
async function CreateTable(params: CreateTableParams): Promise<{
  success: boolean;
  data?: {
    table: Table;
  };
  message?: string;
  details?: object | null;
}> {
  const validate = CreateTableSchema.safeParse(params);
  if (!validate.success) {
    throw new Error(validate.error.issues[0].message);
  }
  const { tableNumber, capacity, zoneId, branchId, qr } = validate.data;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error("Unauthorized");
    }
    const existingTable = await prisma.table.findUnique({
      where: {
        branchId_tableNumber: {
          branchId,
          tableNumber,
        },
      },
    });
    if (existingTable) {
      throw new Error("Table number already exists.");
    }
    const table = await prisma.table.create({
      data: {
        tableNumber,
        capacity,
        zoneId,
        branchId,
        qr,
      },
    });
    if (!table) {
      throw new Error("Table creation failed.");
    }
    return {
      success: true,
      data: {
        table: JSON.parse(JSON.stringify(table)),
      },
      message: "Table created successfully.",
    };
  } catch (e) {
    return errorAction(e);
  }
}

export default CreateTable;
