"use server";
import { getServerSession } from "next-auth";
import UpdateMenuSchema from "../schemas/UpdateMenuSchema";
import { errorAction } from "../response";
import { authOptions } from "../auth-options";
import { prisma } from "../prisma";
import { Menu } from "@/app/types/admin";

type UpdateMenuProp = {
  id: string;
  name: string;
  branchId: string;
};

export async function UpdateMenu(
  params: UpdateMenuProp,
): Promise<{
  success: boolean;
  message: string;
  data?: {
    menu: Menu;
  };
  details?: object | null;
}> {
  const validate = UpdateMenuSchema.safeParse(params);
  if (!validate.success) {
    throw new Error(validate.error.issues[0].message);
  }
  const { id, name, branchId } = validate.data;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Not authenticated");

    const existingMenu = await prisma.menu.findUnique({
      where: { id },
    });
    if (!existingMenu) throw new Error("Menu not found");

    const duplicateMenu = await prisma.menu.findFirst({
      where: { name, branchId, NOT: { id } },
    });
    if (duplicateMenu)
      throw new Error("Menu with this name already exists in this branch");

    const menu = await prisma.menu.update({
      where: { id },
      data: { name, branchId },
    });

    return {
      success: true,
      message: "Menu updated successfully",
      data: { menu },
    };
  } catch (e) {
    return errorAction(e);
  }
}
