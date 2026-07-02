"use server";
import { FormState } from "@/components/admin/AddBranchModel";
import { errorAction } from "../response";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth-options";
import { prisma } from "../prisma";
import { Branch } from "@/app/types/restaurant";
import AddBranchSchema from "../schemas/AddBranchSchema";

export default async function CreateBranch(
  params: FormState,
  restaurantId: string,
): Promise<{
  success: boolean;
  data?: {
    branch: Branch;
  };
  message?: string;
  details?: object | null;
}> {
  try {
    const validated = AddBranchSchema.safeParse(params);
    if (!validated.success) {
      throw new Error(validated.error.issues[0].message);
    }
    const { branchName, branchAddress } = validated.data;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const existingBranch = await prisma.branch.findFirst({
      where: {
        name: branchName,
        restaurantId: restaurantId,
      },
    });
    if (existingBranch) {
      throw new Error("Branch name already exists");
    }

    const branch = await prisma.branch.create({
      data: {
        name: branchName,
        location: branchAddress,
        restaurantId: restaurantId,
        ownerId: session.user.id,
      },
    });

    return {
      success: true,
      data: {
        branch: JSON.parse(JSON.stringify(branch)),
      },
      message: "Branch created successfully",
    };
  } catch (error) {
    return errorAction(error);
  }
}
