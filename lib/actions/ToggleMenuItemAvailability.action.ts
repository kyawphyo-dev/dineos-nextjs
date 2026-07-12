"use server";
import { prisma } from "../prisma";

export default async function ToggleMenuItemAvailability(id: string): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!menuItem) {
      return {
        success: false,
        message: "Menu item not found.",
      };
    }

    const newStatus = menuItem.status === "available" ? "soldOut" : "available";

    await prisma.menuItem.update({
      where: { id },
      data: { status: newStatus },
    });

    return {
      success: true,
      message: "Menu item availability toggled successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to toggle menu item availability.",
    };
  }
}
