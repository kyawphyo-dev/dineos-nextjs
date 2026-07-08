"use server";

import AddPackageSchema from "../schemas/AddPackageSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth-options";
import { errorAction } from "../response";
import { prisma } from "../prisma";

interface AddPackageParams {
  name: string;
  description: string;
  price: number;
  branchId: string;
}

async function AddPackage(params: AddPackageParams) {
  const validate = AddPackageSchema.safeParse(params);
  if (!validate.success) {
    throw new Error(validate.error.issues[0].message);
  }
  const { name, description, price, branchId } = validate.data;
  const session = await getServerSession(authOptions);
  if (!session) {
    return errorAction(new Error("Not authenticated"));
  }
  try {
    const existingPackage = await prisma.package.findFirst({
      where: {
        name,
        branchId,
      },
    });
    if (existingPackage) {
      throw new Error("Package name already exists");
    }
    const newPackage = await prisma.package.create({
      data: {
        name,
        description,
        price,
        branchId,
      },
    });
    return {
      success: true,
      data: {
        package: JSON.parse(JSON.stringify(newPackage)),
      },
    };
  } catch (e) {
    return errorAction(e);
  }
}
export default AddPackage;
