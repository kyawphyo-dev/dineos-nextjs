"use server";

import { prisma } from "../prisma";
import { errorAction } from "../response";
import { authOptions } from "../auth-options";
import { getServerSession } from "next-auth/next";
import type { Prisma } from "@prisma/client";
import { StaffMember, Zone } from "@/app/types/admin";

interface GetAllUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  filter?: string;
}

interface GetAllUsersResponse {
  success: boolean;
  data?: {
    users: any[];
    zoneList: Zone[];
    restaurantList: any[];
    branchList: any[];
    isNext: boolean;
    currentPage: number;
    totalPages: number;
    totalUsers: number;
  };
  message?: string;
  details?: object | null;
}

export async function GetAllUsers({
  page = 1,
  pageSize = 10,
  search,
  filter,
}: GetAllUsersParams): Promise<GetAllUsersResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const authenticatedUser = session.user as any;
    const skip = (page - 1) * pageSize;

    /**
     * Search
     */
    let where: Prisma.StaffWhereInput = {};

    if (search) {
      where = {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            username: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      };
    }

    /**
     * Filter by restaurant/branch based on authenticated user role
     */
    if (authenticatedUser.restaurantId) {
      where.restaurantId = authenticatedUser.restaurantId;
    }
    if (authenticatedUser.branchId) {
      where.branchId = authenticatedUser.branchId;
    }

    /**
     * Sorting
     */
    let orderBy: Prisma.StaffOrderByWithRelationInput;

    switch (filter) {
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

    /**
     * Build zone where clause
     */
    let zoneWhere: Prisma.ZoneWhereInput = {};
    if (authenticatedUser.branchId) {
      zoneWhere.branchId = authenticatedUser.branchId;
    } else if (authenticatedUser.restaurantId) {
      zoneWhere.branch = {
        restaurantId: authenticatedUser.restaurantId,
      };
    }

    /**
     * Fetch Restaurants and Branches based on user
     */
    let restaurantList: any[] = [];
    let branchList: any[] = [];

    if (authenticatedUser.companyId) {
      // Owner: fetch all restaurants and branches for their company
      restaurantList = await prisma.restaurant.findMany({
        where: { companyId: authenticatedUser.companyId },
      });
      branchList = await prisma.branch.findMany({
        where: {
          restaurant: { companyId: authenticatedUser.companyId },
        },
      });
    } else if (authenticatedUser.restaurantId) {
      // Manager or higher with restaurant access
      restaurantList = await prisma.restaurant.findMany({
        where: { id: authenticatedUser.restaurantId },
      });
      if (authenticatedUser.branchId) {
        branchList = await prisma.branch.findMany({
          where: { id: authenticatedUser.branchId },
        });
      } else {
        branchList = await prisma.branch.findMany({
          where: { restaurantId: authenticatedUser.restaurantId },
        });
      }
    }

    /**
     * Execute queries in one transaction
     */
    const [totalUsers, users, zoneList] = await prisma.$transaction([
      prisma.staff.count({
        where,
      }),

      prisma.staff.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,

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
        },
      }),

      prisma.zone.findMany({
        where: zoneWhere,
      }),
    ]);

    const totalPages = Math.ceil(totalUsers / pageSize);

    const isNext = page < totalPages;

    return {
      success: true,

      data: {
        users: users,
        zoneList,
        restaurantList,
        branchList,
        isNext,
        currentPage: page,
        totalPages,
        totalUsers,
      },
    };
  } catch (error) {
    return errorAction(error);
  }
}
