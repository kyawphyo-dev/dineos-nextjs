"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { errorAction } from "@/lib/response";
import { serializePrisma } from "@/lib/serializer";
import PlaceOrderSchema, {
  type PlaceOrderInput,
} from "@/lib/schemas/PlaceOrderSchema";

const ACTIVE_DINING_STATUSES = [
  "seated",
  "ordering",
  "dining",
  "finishedEating",
  "paying",
] as const;

export type PlacedOrderItemResult = {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  note: string | null;
};

export type PlacedOrderResult = {
  id: string;
  branchId: string;
  tableId: string;
  diningSessionId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: PlacedOrderItemResult[];
};

export default async function PlaceOrder(params: PlaceOrderInput): Promise<{
  success: boolean;
  data?: PlacedOrderResult | null;
  message?: string;
  details?: object | null;
}> {
  const validate = PlaceOrderSchema.safeParse(params);
  if (!validate.success) {
    return errorAction(validate.error);
  }

  const { tableId, items } = validate.data;

  try {
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      select: { id: true, branchId: true, tableNumber: true },
    });

    if (!table) {
      return {
        success: false,
        message: "Table not found",
        details: null,
      };
    }

    const diningSession = await prisma.diningSession.findFirst({
      where: {
        tableId: table.id,
        status: {
          in: [...ACTIVE_DINING_STATUSES],
        },
      },
      orderBy: { startedAt: "desc" },
      select: { id: true, status: true },
    });

    if (!diningSession) {
      return {
        success: false,
        message: "No active dining session found for this table",
        details: null,
      };
    }

    const clientMenuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: clientMenuItemIds } },
      select: { id: true, name: true, price: true, status: true },
    });

    if (menuItems.length !== clientMenuItemIds.length) {
      const foundIds = new Set(menuItems.map((m) => m.id));
      const missing = clientMenuItemIds.filter((id) => !foundIds.has(id));
      return {
        success: false,
        message: "Some menu items no longer exist",
        details: { missingMenuItemIds: missing },
      };
    }

    for (const mi of menuItems) {
      if (mi.status !== "available") {
        return {
          success: false,
          message: `Item "${mi.name}" is no longer available`,
          details: { unavailableItem: mi.name },
        };
      }
    }

    const menuItemById = new Map(menuItems.map((m) => [m.id, m]));
    const totalAmount = items.reduce((sum, item) => {
      const mi = menuItemById.get(item.menuItemId)!;
      const priceNum =
        mi.price instanceof Prisma.Decimal
          ? mi.price.toNumber()
          : Number(mi.price);
      return sum + priceNum * item.quantity;
    }, 0);

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          branchId: table.branchId,
          tableId: table.id,
          diningSessionId: diningSession.id,
          status: "pending",
          totalAmount: new Prisma.Decimal(totalAmount),
          items: {
            create: items.map((item) => {
              const menuItem = menuItemById.get(item.menuItemId)!;
              return {
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                price: menuItem.price,
                note: item.note ?? undefined,
              };
            }),
          },
        },
        include: {
          items: {
            include: {
              menuItem: { select: { name: true } },
            },
          },
        },
      });

      if (diningSession.status === "seated") {
        await tx.diningSession.update({
          where: { id: diningSession.id },
          data: { status: "ordering" },
        });
      }

      return order;
    });

    const resultItems: PlacedOrderItemResult[] = result.items.map((oi) => {
      const priceNum =
        oi.price instanceof Prisma.Decimal
          ? oi.price.toNumber()
          : Number(oi.price);
      return {
        id: oi.id,
        menuItemId: oi.menuItemId,
        name: oi.menuItem.name,
        quantity: oi.quantity,
        price: priceNum,
        note: oi.note,
      };
    });

    const placedOrder: PlacedOrderResult = {
      id: result.id,
      branchId: result.branchId,
      tableId: result.tableId ?? table.id,
      diningSessionId: result.diningSessionId ?? diningSession.id,
      status: result.status,
      totalAmount,
      createdAt: result.createdAt.toISOString(),
      items: resultItems,
    };

    return {
      success: true,
      data: serializePrisma(placedOrder) as PlacedOrderResult,
      message: "Order placed successfully.",
    };
  } catch (e) {
    return errorAction(e);
  }
}
