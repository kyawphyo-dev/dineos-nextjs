"use server";
import { errorAction } from "@/lib/response";
import GetByBranchIdSchema from "../schemas/GetByBranchIdSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth-options";
import { prisma } from "../prisma";
import { Zone } from "@/app/types/admin";

export default async function GetZone(branchId: string): Promise<{
  success: boolean;
  data?: {
    zoneList: Zone[];
  };
  message?: string;
}> {
  const validated = GetByBranchIdSchema.safeParse({ branchId });
  if (!validated.success) {
    throw new Error(validated.error.issues[0].message);
  }
  const { branchId: validatedBranchId } = validated.data;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error("Not authenticated in.");
    }
    const zone = await prisma.zone.findMany({
      where: {
        branchId: validatedBranchId,
      },
      include: {
        tables: true,
        staff: true,
      },
    });
    if (!zone) {
      throw new Error("Zone not found.");
    }
    return {
      success: true,
      data: {
        zoneList: zone,
      },
      message: "Zone list successfully retrieved.",
    };
  } catch (e) {
    return errorAction(e);
  }
}
