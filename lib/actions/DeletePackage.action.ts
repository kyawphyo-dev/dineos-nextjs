"use server";
import { prisma } from "../prisma";

export default async function DeletePackage(id: string): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
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
