import { getServerSession } from "next-auth";
import { prisma } from "../prisma";
import { errorAction } from "../response";
import GetByBranchIdSchema from "../schemas/GetByBranchIdSchema";
import { authOptions } from "../auth-options";
import { Menu } from "@/app/types/admin";

async function GetMenuWithCategoriesAndItems({
  params,
}: {
  params: { branchId: string };
}): Promise<{
  success: boolean;
  message: string;
  data?: {
    data: Menu[];
  };
  details?: object | null;
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
          orderBy: {
            name: "asc" as const,
          },
          include: {
            items: {
              orderBy: {
                name: "asc" as const,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc" as const,
      },
    });
    return {
      success: true,
      data: {
        data: menus,
      },
      message: "Success",
    };
  } catch (err) {
    return errorAction(err);
  }
}
export default GetMenuWithCategoriesAndItems;
