"use server";
import { getServerSession } from "next-auth";
import { errorAction } from "../response";
import UpdateStaffZoneSchema from "../schemas/UpdateStaffZoneSchema";
import { authOptions } from "../auth-options";
import { prisma } from "../prisma";

interface IUpdateStaffZoneParams {
  id: string;
  zoneId: string;
}

async function UpdateStaffZone(params: IUpdateStaffZoneParams): Promise<{
  success: boolean;
  data?: {
    user: any;
  };
  message?: string;
  details?: object | null;
}> {
  try {
    const validate = UpdateStaffZoneSchema.safeParse(params);
    if (!validate.success) {
      return errorAction(validate.error);
    }
    const { id, zoneId } = validate.data;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorAction("Unauthorized");
    }
    const authenticatedUser = session.user as any;
    if (
      authenticatedUser.role !== "owner" &&
      authenticatedUser.role !== "manager"
    ) {
      return errorAction(
        "Forbidden! Only owner and manager can update staff zones.",
      );
    }
    const staff = await prisma.staff.findUnique({ where: { id } });
    if (!staff) {
      return errorAction("Staff member not found.");
    }
    if (staff.zoneId === zoneId) {
      return errorAction("Staff member already has the same zone.");
    }
    await prisma.staff.update({
      where: { id },
      data: { zoneId },
    });

    return {
      success: true,
      data: {
        user: JSON.parse(JSON.stringify(staff)),
      },
      message: "Zone updated successfully.",
    };
  } catch (e) {
    return errorAction(e);
  }
}
export default UpdateStaffZone;
