"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth-options";
import GetDashboardDataSchema from "../schemas/GetDashboardDataSchema";
import { errorAction } from "../response";
import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";

type Params = {
  restaurantId: string;
  branchId: string;
};

type DashboardCounts = {
  menus: number;
  staff: number;
  orders: number;
  tables: number;
  packages: number;
  zone: number;
};

type DashboardData = {
  branch: Prisma.BranchGetPayload<{}>;
  counts: DashboardCounts;
  restaurantName: string | null;
};

export default async function GetDashboardData(params: {
  restaurantId: string;
  branchId: string;
}): Promise<{
  success: boolean;
  data?: DashboardData;
  message?: string;
}> {
  const validate = GetDashboardDataSchema.safeParse(params);
  if (!validate.success) {
    throw new Error(
      validate.error.issues[0].message || validate.error.issues[1].message,
    );
  }

  const { restaurantId: validatedRestaurantId, branchId: validatedBranchId } =
    validate.data;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Please login first");
  }
  try {
    const branch = await prisma.branch.findUnique({
      where: {
        id: validatedBranchId,
        restaurantId: validatedRestaurantId,
      },
      include: {
        _count: {
          select: {
            menus: true,
            staff: true,
            orders: true,
            tables: true,
            packages: true,
            zone: true,
          },
        },
      },
    });

    if (!branch) {
      return {
        success: false,
        message: "Branch not found",
      };
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id: validatedRestaurantId,
      },
      select: {
        name: true,
      },
    });

    const restaurantName = restaurant?.name;

    const { _count, ...branchWithoutCount } = branch;

    return {
      success: true,
      data: {
        branch: branchWithoutCount,
        counts: _count,
        restaurantName,
      },
      message: "Dashboard data fetched successfully.",
    };
  } catch (error) {
    return errorAction(error);
  }
}
