"use server";

import { prisma } from "../prisma";
import { errorAction } from "../response";
import { authOptions } from "../auth-options";
import { getServerSession } from "next-auth/next";
import type { Prisma } from "@prisma/client";
import { authenticatedUser, StaffMember, Zone } from "@/app/types/admin";
import GetAllUserPaginateSchema from "../schemas/GetAllUserPaginateSchema";

type restaurant = {
  id: string;
  name: string;
};
type branch = {
  id: string;
  name: string;
};

interface GetAllUsersParams {
  restaurantId: string;
  branchId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  filter?: string;
}

interface GetAllUsersResponse {
  success: boolean;
  data?: {
    users: StaffMember[];
    zoneList: Zone[];
    restaurant: restaurant;
    branch: branch;
    isNext: boolean;
    currentPage: number;
    totalPages: number;
    totalUsers: number;
  };
  message?: string;
  details?: object | null;
}

export async function GetAllUsers({
  restaurantId,
  branchId,
  page = 1,
  pageSize = 10,
  search,
  filter,
}: GetAllUsersParams): Promise<GetAllUsersResponse> {
  try {
    const validated = GetAllUserPaginateSchema.safeParse({
      restaurantId,
      branchId,
      page,
      pageSize,
      search,
      filter,
    });

    if (!validated.success) {
      throw new Error(validated.error.issues[0].message);
    }

    const {
      restaurantId: validatedRestaurantId,
      branchId: validatedBranchId,
      page: validatedPage,
      pageSize: validatedPageSize,
      search: validatedSearch,
      filter: validatedFilter,
    } = validated.data;

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const sessionUser = session.user as authenticatedUser;
    const skip = (validatedPage - 1) * validatedPageSize;

    /**
     * Search
     */
    let where: Prisma.StaffWhereInput = {};

    if (validatedSearch) {
      where = {
        OR: [
          {
            name: {
              contains: validatedSearch,
              mode: "insensitive",
            },
          },
          {
            username: {
              contains: validatedSearch,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: validatedSearch,
              mode: "insensitive",
            },
          },
        ],
      };
    }

    /**
     * Filter by restaurant/branch
     */
    if (validatedRestaurantId) {
      where.restaurantId = validatedRestaurantId;
    }
    if (validatedBranchId) {
      where.branchId = validatedBranchId;
    }

    /**
     * Sorting
     */
    let orderBy: Prisma.StaffOrderByWithRelationInput;

    switch (validatedFilter) {
      case "newest":
        orderBy = {
          createdAt: "desc" as const,
        };
        break;

      case "oldest":
        orderBy = {
          createdAt: "asc" as const,
        };
        break;

      case "name":
        orderBy = {
          name: "asc" as const,
        };
        break;

      default:
        orderBy = {
          createdAt: "desc" as const,
        };
    }

    // Fetch restaurant and branch from params
    const restaurant = await prisma.restaurant.findFirst({
      where: { id: validatedRestaurantId },
    });
    const branch = await prisma.branch.findFirst({
      where: { id: validatedBranchId },
    });

    /**
     * Build zone where clause: fetch all zones for this branch
     */
    const zoneWhere: Prisma.ZoneWhereInput = {};
    zoneWhere.branchId = validatedBranchId;

    const [totalUsers, users, zoneList] = await prisma.$transaction([
      prisma.staff.count({
        where,
      }),

      prisma.staff.findMany({
        where,
        orderBy,
        skip,
        take: validatedPageSize,

        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          role: true,
          branchId: true,
          restaurantId: true,
          zoneId: true,
          status: true,
          createdAt: true,
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
          restaurant: {
            select: {
              id: true,
              name: true,
            },
          },
          zone: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),

      prisma.zone.findMany({
        where: zoneWhere,
      }),
    ]);

    const totalPages = Math.ceil(totalUsers / validatedPageSize);
    const isNext = validatedPage < totalPages;

    return {
      success: true,

      data: {
        users: users as StaffMember[],
        zoneList: zoneList as Zone[],
        restaurant,
        branch,
        isNext,
        currentPage: validatedPage,
        totalPages,
        totalUsers,
      },
    };
  } catch (error) {
    return errorAction(error);
  }
}
