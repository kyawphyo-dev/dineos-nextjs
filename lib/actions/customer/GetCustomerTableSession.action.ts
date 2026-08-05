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
  session: {
    id: string;
    status: (typeof ACTIVE_DINING_STATUSES)[number];
    package: {
      id: string;
      name: string;
      description: string;
      price: number;
    } | null;
  } | null;
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
    const table = await prisma.table.findUnique({
      where: { id: tableIdentifier },
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
        package: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
          },
        },
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
              package: session.package
                ? {
                    id: session.package.id,
                    name: session.package.name,
                    description: session.package.description,
                    price: session.package.price,
                  }
                : null,
            }
          : null,
      },
      message: "Table session retrieved successfully.",
    };
  } catch (e) {
    return errorAction(e);
  }
}
