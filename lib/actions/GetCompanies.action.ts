"use server";
import { Company } from "@prisma/client";
import { prisma } from "../prisma";
import { errorAction } from "../response";
import GetCompaniesSchema from "../schemas/GetCompaniesSchema";

async function GetCompanies(companyId: string): Promise<{
  success: boolean;
  data?: Company | null;
  message?: string;
  details: object | null;
}> {
  try {
    const validate = GetCompaniesSchema.safeParse(companyId);
    if (!validate.success) {
      throw new Error(validate.error.message);
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        restaurant: {
          include: {
            branches: true,
          },
        },
      },
    });
    return {
      success: true,
      data: company,
      message: "Company found",
      details: null,
    };
  } catch (e) {
    return errorAction(e);
  }
}

export default GetCompanies;
