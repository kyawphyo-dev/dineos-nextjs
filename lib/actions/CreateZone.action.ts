"use server";
import { Zone } from "@/app/types/admin";
import { prisma } from "../prisma";
import { errorAction } from "../response";
import CreateZoneSchema from "../schemas/CreateZoneSchema";

type CreateZoneParams = {
  name: string;
  branchId: string;
};
async function CreateZone(params: CreateZoneParams): Promise<{
  success: boolean;
  data?: Zone;
  message?: string;
}> {
  const validated = CreateZoneSchema.safeParse(params);
  if (!validated.success) {
    return {
      success: false,
      message: validated.error.issues[0].message,
    };
  }
  const { name, branchId } = validated.data;

  try {
    const existingZoneName = await prisma.zone.findFirst({
      where: {
        name,
      },
    });
    if (existingZoneName) {
      return {
        success: false,
        message: "Zone name already exists.",
      };
    }
    const zone = await prisma.zone.create({
      data: {
        name,
        branchId,
      },
    });
    return {
      success: true,
      data: zone,
      message: "Zone added successfully.",
    };
  } catch (e) {
    return errorAction(e);
  }
}
export default CreateZone;
