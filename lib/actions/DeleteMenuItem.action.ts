"use server";
import cloudinary from "../cloudinary";
import { prisma } from "../prisma";

export default async function DeleteMenuItem(id: string): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const deleteItem = await prisma.menuItem.findUnique({
      where: {
        id,
      },
    });
    if (!deleteItem) {
      return {
        success: false,
        message: "Menu item not found.",
      };
    }
    await cloudinary.uploader.destroy(deleteItem.imageId || "");
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
        error instanceof Error ? error.message : "Failed to delete menu item.",
    };
  }
}
