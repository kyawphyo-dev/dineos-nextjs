"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { errorAction } from "@/lib/response";
import { authenticatedUser } from "@/app/types/admin";

export async function getStaffTables() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorAction("Unauthorized");
  }

  const { branchId } = session.user as authenticatedUser;
  if (!branchId) {
    return errorAction("No branch assigned");
  }

  try {
    const tables = await prisma.table.findMany({
      where: { branchId },
      include: {
        zone: true,
        reservations: {
          where: {
            status: {
              in: ["pending", "confirmed", "arrived"],
            },
          },
          orderBy: {
            reservedTime: "asc",
          },
          take: 1,
        },
        diningSessions: {
          where: {
            status: {
              in: ["seated", "ordering", "dining", "finishedEating", "paying"],
            },
          },
          include: {
            package: true,
            startedBy: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            startedAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: [
        {
          zone: {
            createdAt: "asc",
          },
        },
        {
          tableNumber: "asc",
        },
      ],
    });

    return {
      success: true,
      data: {
        tables: JSON.parse(JSON.stringify(tables)),
      },
      message: "Tables retrieved successfully.",
    };
  } catch (e) {
    return errorAction(e);
  }
}
