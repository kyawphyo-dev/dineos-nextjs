"use server";
import { prisma } from "../prisma";

export default async function DeleteMenuItem(id: string): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    await prisma.menuItem.delete({
      where: {
        id,
      },
    });
    return {
      success: true,
      message: "Menu item deleted successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete menu item.",
    };
  }
}
