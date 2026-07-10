"use server";

import { getServerSession } from "next-auth";
import { errorAction } from "../response";
import CreateCategorySchema from "../schemas/CreateCategorySchema";
import { authOptions } from "../auth-options";
import { prisma } from "../prisma";
import { success } from "zod";

type CategoryForm = {
  name: string;
  menuId: string;
  description?: string;
};
async function CreateCategory({ form }: { form: CategoryForm }) {
  const validate = CreateCategorySchema.safeParse(form);
  if (!validate.success) {
    throw new Error(validate.error.issues[0].message);
  }
  const { name, menuId, description } = validate.data;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error("Not authenticated");
    }
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        menuId,
      },
    });
    if (existingCategory) {
      throw new Error("Category already exists");
    }
    const category = await prisma.category.create({
      data: {
        name,
        menuId,
        description,
      },
    });
    return {
      success: true,
      data: {
        category,
      },
      message: "Category created successfully",
    };
  } catch (err) {
    return errorAction(err);
  }
}

export default CreateCategory;
