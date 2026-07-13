"use server";
import { getServerSession } from "next-auth";
import UpdateCategorySchema from "../schemas/UpdateCategorySchema";
import { errorAction } from "../response";
import { authOptions } from "../auth-options";
import { prisma } from "../prisma";
import { Category } from "@/app/types/admin";

type UpdateCategoryProp = {
  id: string;
  name: string;
  menuId: string;
  description?: string;
};

export async function UpdateCategory(
  params: UpdateCategoryProp,
): Promise<{
  success: boolean;
  message: string;
  data?: {
    category: Category;
  };
  details?: object | null;
}> {
  const validate = UpdateCategorySchema.safeParse(params);
  if (!validate.success) {
    throw new Error(validate.error.issues[0].message);
  }
  const { id, name, menuId, description } = validate.data;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Not authenticated");

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });
    if (!existingCategory) throw new Error("Category not found");

    const duplicateCategory = await prisma.category.findFirst({
      where: { name, menuId, NOT: { id } },
    });
    if (duplicateCategory)
      throw new Error("Category with this name already exists in this menu");

    const category = await prisma.category.update({
      where: { id },
      data: { name, menuId, description },
    });

    return {
      success: true,
      message: "Category updated successfully",
      data: { category },
    };
  } catch (e) {
    return errorAction(e);
  }
}
