"use server";
import { getServerSession } from "next-auth";
import { StaffRole } from "../auth";
import { errorAction } from "../response";
import UpdateStaffRoleSchema from "../schemas/UpdateStaffRoleSchema";
import { authOptions } from "../auth-options";
import { prisma } from "../prisma";

interface IUpdateStaffRoleParams {
  id: string;
  role: StaffRole;
}

async function UpdateUserRole(params: IUpdateStaffRoleParams): Promise<{
  success: boolean;
  data?: {
    user: any;
  };
  message?: string;
  details?: object | null;
}> {
  try {
    const validate = UpdateStaffRoleSchema.safeParse(params);
    if (!validate.success) {
      return errorAction(validate.error);
    }
    const { id, role } = validate.data;
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
        "Forbidden! Only owner and manager can update staff roles.",
      );
    }
    const staff = await prisma.staff.findUnique({ where: { id } });
    if (!staff) {
      return errorAction("Staff member not found.");
    }
    if (staff.role === role) {
      return errorAction("Staff member already has the same role.");
    }
    await prisma.staff.update({
      where: { id },
      data: { role: role as StaffRole },
    });

    return {
      success: true,
      data: {
        user: JSON.parse(JSON.stringify(staff)),
      },
      message: "Role updated successfully.",
    };
  } catch (e) {
    return errorAction(e);
  }
}
export default UpdateUserRole;
