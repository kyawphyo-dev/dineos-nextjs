"use server";

import { getServerSession } from "next-auth";
import GetByBranchIdSchema from "../schemas/GetByBranchIdSchema";
import { authOptions } from "../auth-options";
import { errorAction } from "../response";
import { prisma } from "../prisma";
import { Menu } from "@/app/types/admin";

async function GetMenuList(params: { branchId: string }): Promise<{
  success: boolean;
  data?: {
    menuList: Menu[];
  };
  message?: string;
  object?: object | null;
}> {
  const validated = GetByBranchIdSchema.safeParse(params);
  if (!validated.success) {
    throw new Error(validated.error.issues[0].message);
  }
  const { branchId } = validated.data;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    const menus = await prisma.menu.findMany({
      where: {
        branchId,
      },
      include: {
        categories: {
          include: {
            items: true,
          },
        },
      },
    });
    if (!menus) {
      return {
        success: true,
        data: {
          menuList: [],
        },
        message: "No menu found.",
      };
    }
    return {
      success: true,
      data: {
        menuList: JSON.parse(JSON.stringify(menus)),
      },
      message: "Menu list retrieved successfully.",
    };
  } catch (err) {
    return errorAction(err);
  }
}
export default GetMenuList;
