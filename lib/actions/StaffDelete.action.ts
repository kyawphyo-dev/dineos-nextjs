"use server";
import { prisma } from "../prisma";

export default async function StaffDelete(id: string): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    await prisma.staff.delete({
      where: {
        id,
      },
    });
    return {
      success: true,
      message: "Staff member deleted successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete staff member.",
    };
  }
}
