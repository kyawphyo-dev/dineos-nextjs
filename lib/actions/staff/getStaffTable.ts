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
      include: { zone: true },
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
