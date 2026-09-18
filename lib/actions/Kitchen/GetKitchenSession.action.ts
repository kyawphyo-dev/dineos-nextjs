"use server";

import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { errorAction } from "@/lib/response";
import { serializePrisma } from "@/lib/serializer";
import { getServerSession } from "next-auth";
import type { Station, Ticket, TicketItem } from "@/app/types/kitchen";
import type { Menu, Category } from "@/app/types/admin";

const ACTIVE_ORDER_STATUSES = ["pending", "preparing", "served"] as const;

export type KitchenMenuItem = {
  id: string;
  name: string;
  price: number;
  status: "available" | "soldOut";
  categoryId: string;
  categoryName: string;
  station: Station;
  description?: string | null;
  imageUrl?: string | null;
};

export type KitchenCategory = {
  id: string;
  name: string;
  description?: string | null;
  menuId: string;
  items: KitchenMenuItem[];
};

export type KitchenMenu = {
  id: string;
  name: string;
  branchId: string;
  categories: KitchenCategory[];
};

function mapCategoryToStation(categoryName: string): Station {
  const name = categoryName.toLowerCase();
  if (
    name.includes("drink") ||
    name.includes("beverage") ||
    name.includes("tea") ||
    name.includes("coffee") ||
    name.includes("juice") ||
    name.includes("soda") ||
    name.includes("water")
  ) {
    return "Drinks";
  }
  if (
    name.includes("dessert") ||
    name.includes("sweet") ||
    name.includes("ice cream") ||
    name.includes("cake") ||
    name.includes("pudding")
  ) {
    return "Dessert";
  }
  if (
    name.includes("salad") ||
    name.includes("cold") ||
    name.includes("appetizer") ||
    name.includes("starter") ||
    name.includes("soup")
  ) {
    return "Salad & Cold";
  }
  return "Grill";
}

function mapOrderStatusToTicket(status: string): Ticket["status"] {
  switch (status) {
    case "pending":
      return "new";
    case "preparing":
      return "preparing";
    case "served":
      return "ready";
    case "completed":
      return "served";
    default:
      return "new";
  }
}

export type KitchenSessionResult = {
  restaurant: {
    id: string;
    name: string;
  };
  branch: {
    id: string;
    name: string;
    location: string | null;
  };
  menus: KitchenMenu[];
  categories: KitchenCategory[];
  tickets: Ticket[];
};

export default async function getKitchenSession(): Promise<{
  success: boolean;
  data?: KitchenSessionResult | null;
  message?: string;
  details?: object | null;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error("Not authenticated");
    }
    const { user } = session;
    if (!user.branchId) {
      throw new Error("Branch ID not found");
    }

    const branch = await prisma.branch.findUnique({
      where: { id: user.branchId },
      select: {
        id: true,
        name: true,
        location: true,
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
        menus: {
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            branchId: true,
            categories: {
              orderBy: { name: "asc" },
              select: {
                id: true,
                name: true,
                description: true,
                menuId: true,
                items: {
                  orderBy: { name: "asc" },
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    status: true,
                    description: true,
                    imageUrl: true,
                    categoryId: true,
                  },
                },
              },
            },
          },
        },
        orders: {
          where: {
            status: { in: [...ACTIVE_ORDER_STATUSES] },
          },
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            status: true,
            createdAt: true,
            totalAmount: true,
            table: {
              select: {
                tableNumber: true,
              },
            },
            diningSession: {
              select: {
                id: true,
                guestCount: true,
                package: {
                  select: { name: true },
                },
              },
            },
            items: {
              select: {
                id: true,
                quantity: true,
                note: true,
                price: true,
                menuItem: {
                  select: {
                    id: true,
                    name: true,
                    category: {
                      select: {
                        name: true,
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

    if (!branch) {
      return {
        success: true,
        data: null,
        message: "Branch not found",
      };
    }

    const menus: KitchenMenu[] = [];
    const categories: KitchenCategory[] = [];

    for (const menu of branch.menus) {
      const menuCategories: KitchenCategory[] = [];
      for (const category of menu.categories) {
        const station = mapCategoryToStation(category.name);
        const categoryItems: KitchenMenuItem[] = category.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          status: item.status === "available" ? "available" : "soldOut",
          categoryId: item.categoryId,
          categoryName: category.name,
          station,
          description: item.description,
          imageUrl: item.imageUrl,
        }));
        const kitchenCategory: KitchenCategory = {
          id: category.id,
          name: category.name,
          description: category.description,
          menuId: category.menuId,
          items: categoryItems,
        };
        menuCategories.push(kitchenCategory);
        categories.push(kitchenCategory);
      }
      menus.push({
        id: menu.id,
        name: menu.name,
        branchId: menu.branchId,
        categories: menuCategories,
      });
    }

    const tickets: Ticket[] = [];
    for (const order of branch.orders) {
      const items: TicketItem[] = order.items.map((orderItem) => ({
        id: orderItem.id,
        name: orderItem.menuItem.name,
        qty: orderItem.quantity,
        station: mapCategoryToStation(orderItem.menuItem.category.name),
        note: orderItem.note ?? undefined,
      }));

      tickets.push({
        id: order.id,
        tableId: order.table?.tableNumber ?? "—",
        status: mapOrderStatusToTicket(order.status),
        placedAt: order.createdAt.getTime(),
        items,
      });
    }

    const result: KitchenSessionResult = {
      restaurant: {
        id: branch.restaurant.id,
        name: branch.restaurant.name,
      },
      branch: {
        id: branch.id,
        name: branch.name,
        location: branch.location,
      },
      menus,
      categories,
      tickets,
    };

    return {
      success: true,
      data: serializePrisma(result) as unknown as KitchenSessionResult,
      message: "Kitchen session retrieved successfully.",
    };
  } catch (e) {
    return errorAction(e);
  }
}
