"use server";
import { getServerSession } from "next-auth";
import { errorAction } from "../response";
import { authOptions } from "../auth-options";
import { prisma } from "../prisma";
import cloudinary from "../cloudinary";

export async function DeleteCategory(categoryId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Not authenticated");

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        items: {
          select: {
            imageId: true,
          },
        },
      },
    });

    if (!category) {
      return { success: false, message: "Category not found" };
    }

    for (const item of category.items) {
      if (item.imageId) {
        await cloudinary.uploader.destroy(item.imageId);
      }
    }

    // Prisma will handle cascade delete for menu items if relation is set, but let's explicitly delete to be safe
    await prisma.menuItem.deleteMany({
      where: {
        categoryId,
      },
    });

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return {
      success: true,
      message: "Category and all related menu items deleted successfully",
    };
  } catch (e) {
    return errorAction(e);
  }
}
