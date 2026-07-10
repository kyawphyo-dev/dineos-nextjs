"use server";

import { getServerSession } from "next-auth";
import { errorAction } from "../response";
import CreateMenuSchema from "../schemas/CreateMenuSchema";
import { authOptions } from "../auth-options";
import { prisma } from "../prisma";
import { Menu } from "@/app/types/admin";

async function CreateMenu(params: { name: string; branchId: string }): Promise<{
  success: boolean;
  data?: {
    menu: Menu;
  };
  message?: string;
  details?: object | null;
}> {
  const validated = CreateMenuSchema.safeParse(params);
  if (!validated.success) {
    throw new Error(validated.error.issues[0].message);
  }
  const { name, branchId } = validated.data;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("User not authenticated");
    }
    const existingMenu = await prisma.menu.findFirst({
      where: {
        name,
        branchId,
      },
    });
    if (existingMenu) {
      throw new Error("Menu already exists");
    }
    const menu = await prisma.menu.create({
      data: {
        name,
        branchId,
      },
    });
    return {
      success: true,
      data: {
        menu,
      },
      message: "Menu created successfully",
    };
  } catch (e) {
    return errorAction(e);
  }
}
export default CreateMenu;
