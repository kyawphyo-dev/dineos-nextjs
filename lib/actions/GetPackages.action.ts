import { getServerSession } from "next-auth";
import { errorAction } from "../response";
import GetByBranchIdSchema from "../schemas/GetByBranchIdSchema";
import { authOptions } from "../auth-options";
import { prisma } from "../prisma";
import { AdminPackage } from "@/app/types/admin";

async function GetPackages(params: { branchId: string }): Promise<{
  success: boolean;
  data?: {
    packages: AdminPackage[];
  };
  message?: string;
  details?: object | null;
}> {
  const validated = GetByBranchIdSchema.safeParse(params);
  if (!validated.success) {
    throw new Error(validated.error.issues[0].message);
  }
  const { branchId } = validated.data;
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Not authenticated");
  }
  try {
    const packages = await prisma.package.findMany({
      where: {
        branchId,
      },
    });
    return {
      success: true,
      data: {
        packages,
      },
    };
  } catch (e) {
    return errorAction(e);
  }
}
export default GetPackages;
