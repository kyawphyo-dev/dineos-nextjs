"use server";

import GetCustomerTableSessionSchema from "@/lib/schemas/GetCustomerTableSessionSchema";
import { prisma } from "@/lib/prisma";
import { errorAction } from "@/lib/response";
import { serializePrisma } from "@/lib/serializer";

const ORDER_ALLOWED_DINING_STATUSES = ["seated", "ordering", "dining"] as const;

const ACTIVE_DINING_STATUSES = [
  ...ORDER_ALLOWED_DINING_STATUSES,
  "finishedEating",
  "paying",
] as const;

export type CustomerTableCategoryItem = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  status: "available" | "soldOut";
  imageUrl: string | null;
};

export type CustomerTableCategory = {
  id: string;
  name: string;
  description: string | null;
  items: CustomerTableCategoryItem[];
};

export type CustomerTableOrderItem = {
  name: string;
  qty: number;
  price: number;
};

export type CustomerTableOrder = {
  id: string;
  status: string;
  placedAt: string;
  items: CustomerTableOrderItem[];
};

export type CustomerTableStatus =
  | "available"
  | "reserved"
  | "occupied"
  | "need_attention"
  | "request_bill"
  | "cleaning"
  | "maintenance";

export type CustomerTableSessionResult = {
  restaurant: {
    id: string;
    name: string;
  };
  branch: {
    id: string;
    name: string;
    location: string | null;
  };
  table: {
    id: string;
    tableNumber: string;
    capacity: number;
    status: CustomerTableStatus;
  };
  session: {
    id: string;
    status: (typeof ACTIVE_DINING_STATUSES)[number];
    startedAt: string;
    guestCount: number;
    package: {
      id: string;
      name: string;
      description: string;
      price: number;
    } | null;
  } | null;
  categories: CustomerTableCategory[];
  orders: CustomerTableOrder[];
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
        capacity: true,
        status: true,
        branch: {
          include: {
            restaurant: true,
            menus: {
              orderBy: { createdAt: "desc" },
              include: {
                categories: {
                  orderBy: { name: "asc" },
                  include: {
                    items: {
                      orderBy: { name: "asc" },
                      select: {
                        id: true,
                        name: true,
                        price: true,
                        description: true,
                        status: true,
                        imageUrl: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
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
      include: {
        package: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
          },
        },
        orders: {
          where: {
            status: { not: "cancelled" },
          },
          orderBy: { createdAt: "desc" },
          include: {
            items: {
              include: {
                menuItem: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    const allMenus = table.branch.menus ?? [];
    const seenCategoryIds = new Set<string>();
    const categoriesRaw: Array<{
      id: string;
      name: string;
      description: string | null;
      items: Array<{
        id: string;
        name: string;
        price: unknown;
        description: string | null;
        status: unknown;
        imageUrl: string | null;
      }>;
    }> = [];

    for (const menu of allMenus) {
      for (const cat of menu.categories ?? []) {
        if (seenCategoryIds.has(cat.id)) continue;
        seenCategoryIds.add(cat.id);
        categoriesRaw.push(cat);
      }
    }

    const categories = categoriesRaw
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        items: cat.items
          .filter(
            (it) =>
              it.status === "available" ||
              String(it.status).toLowerCase() === "available",
          )
          .map((it) => ({
            id: it.id,
            name: it.name,
            price: it.price as number,
            description: it.description,
            status: it.status as "available" | "soldOut",
            imageUrl: it.imageUrl,
          })),
      }))
      .filter((cat) => cat.items.length > 0);

    const orders =
      session?.orders.map((o) => ({
        id: o.id,
        status: o.status,
        placedAt: o.createdAt.toISOString(),
        items: o.items.map((oi) => ({
          name: oi.menuItem.name,
          qty: oi.quantity,
          price: oi.price,
        })),
      })) ?? [];

    const result = {
      restaurant: {
        id: table.branch.restaurant.id,
        name: table.branch.restaurant.name,
      },
      branch: {
        id: table.branch.id,
        name: table.branch.name,
        location: table.branch.location,
      },
      table: {
        id: table.id,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        status: table.status as CustomerTableStatus,
      },
      session: session
        ? {
            id: session.id,
            status: session.status as (typeof ACTIVE_DINING_STATUSES)[number],
            startedAt: session.startedAt.toISOString(),
            guestCount: session.guestCount,
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
      categories,
      orders,
    };

    return {
      success: true,
      data: serializePrisma(result) as unknown as CustomerTableSessionResult,
      message: "Table session retrieved successfully.",
    };
  } catch (e) {
    return errorAction(e);
  }
}
