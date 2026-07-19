"use server";

import { authenticatedUser } from "@/app/types/admin";
import { Branch } from "@/app/types/restaurant";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { errorAction } from "@/lib/response";
import { getServerSession } from "next-auth";

export async function GetRestaurant(): Promise<{
  success: boolean;
  data?: {
    branch: Branch;
  };
  message?: string;
  details?: object | null;
}> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  const { branchId } = session.user as authenticatedUser;
  if (!branchId) {
    throw new Error("No branch assigned");
  }
  try {
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      include: { restaurant: true },
    });
    if (!branch) {
      throw new Error("No branch found");
    }
    return {
      success: true,
      data: {
        branch: JSON.parse(JSON.stringify(branch)),
      },
      message: "Branch retrieved successfully.",
    };
  } catch (e) {
    return errorAction(e);
  }
}
