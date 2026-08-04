"use server";

import GetCustomerTableSessionSchema from "@/lib/schemas/GetCustomerTableSessionSchema";
import { prisma } from "@/lib/prisma";
import { errorAction } from "@/lib/response";

const ACTIVE_DINING_STATUSES = [
  "seated",
  "ordering",
  "dining",
  "finishedEating",
  "paying",
] as const;

export type CustomerTableSessionResult = {
  table: {
    id: string;
    tableNumber: string;
  };
  session:
    | {
        id: string;
        status: (typeof ACTIVE_DINING_STATUSES)[number];
      }
    | null;
};

export default async function GetCustomerTableSession(params: {
  tableIdentifier: string;
}): Promise<{
  success: boolean;
  data?: CustomerTableSessionResult | null;
  message?: string;
  details?: object | null;
}> {
  const validate = GetCustomerTableSessionSchema.safeParse(params);
  if (!validate.success) {
    return errorAction(validate.error);
  }

  const { tableIdentifier } = validate.data;

  try {
    const table = await prisma.table.findFirst({
      where: {
        OR: [{ id: tableIdentifier }, { qr: tableIdentifier }],
      },
      select: {
        id: true,
        tableNumber: true,
      },
    });

    if (!table) {
      return {
        success: true,
        data: null,
        message: "Table not found",
      };
    }

    const session = await prisma.diningSession.findFirst({
      where: {
        tableId: table.id,
        status: {
          in: [...ACTIVE_DINING_STATUSES],
        },
      },
      orderBy: {
        startedAt: "desc",
      },
      select: {
        id: true,
        status: true,
      },
    });

    return {
      success: true,
      data: {
        table,
        session: session
          ? {
              id: session.id,
              status: session.status as (typeof ACTIVE_DINING_STATUSES)[number],
            }
          : null,
      },
      message: "Table session retrieved successfully.",
    };
  } catch (e) {
    return errorAction(e);
  }
}

