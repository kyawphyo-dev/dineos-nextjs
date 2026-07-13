"use server";
import { getServerSession } from "next-auth";
import { errorAction } from "../response";
import { authOptions } from "../auth-options";
import { prisma } from "../prisma";
import cloudinary from "../cloudinary";

export async function DeleteMenu(menuId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Not authenticated");

    // Find menu with all categories and items to get all imageIds
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        categories: {
          include: {
            items: {
              select: { imageId: true },
            },
          },
        },
      },
    });

    if (!menu) {
      return { success: false, message: "Menu not found" };
    }

    // Delete all Cloudinary images for all menu items in all categories
    for (const category of menu.categories) {
      for (const item of category.items) {
        if (item.imageId) {
          await cloudinary.uploader.destroy(item.imageId);
        }
      }
    }

    // Prisma should handle cascading, but let's explicitly delete to be safe
    // First delete menu items
    for (const category of menu.categories) {
      await prisma.menuItem.deleteMany({
        where: { categoryId: category.id },
      });
    }

    // Then delete categories
    await prisma.category.deleteMany({
      where: { menuId },
    });

    // Then delete menu
    await prisma.menu.delete({
      where: { id: menuId },
    });

    return {
      success: true,
      message: "Menu, all categories, and menu items deleted successfully",
    };
  } catch (e) {
    return errorAction(e);
  }
}
