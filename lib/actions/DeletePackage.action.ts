"use server";
import { prisma } from "../prisma";
import cloudinary from "../cloudinary";

export default async function DeletePackage(id: string): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const packageToDelete = await prisma.package.findUnique({
      where: { id },
    });
    if (!packageToDelete) {
      throw new Error("Package not found");
    }

    if (packageToDelete.imageId) {
      await cloudinary.uploader.destroy(packageToDelete.imageId);
    }

    await prisma.packageMenuItem.deleteMany({
      where: {
        packageId: packageToDelete.id,
      },
    });

    await prisma.package.delete({
      where: {
        id,
      },
    });
    return {
      success: true,
      message: "Package deleted successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete package.",
    };
  }
}
