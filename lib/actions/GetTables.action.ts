import { getServerSession } from "next-auth";
import GetByBranchIdSchema from "../schemas/GetByBranchIdSchema";
import { authOptions } from "../auth-options";
import { errorAction } from "../response";
import { prisma } from "../prisma";
import { Table } from "@/app/types/restaurant";
import { Zone } from "@/app/types/admin";

async function GetTables({
  params,
}: {
  params: { branchId: string };
}): Promise<{
  success: boolean;
  data?: {
    tables: Table[];
    zones: Zone[];
  };
  message?: string;
  details?: object | null;
}> {
  const validate = GetByBranchIdSchema.safeParse(params);
  if (!validate.success) {
    throw new Error(validate.error.issues[0].message);
  }
  const { branchId } = validate.data;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return errorAction("Unauthorized");
  }
  try {
    const [tables, zones] = await Promise.all([
      prisma.table.findMany({
        where: { branchId },
        include: { zone: true },
      }),

      prisma.zone.findMany({
        where: { branchId },
        orderBy: {
          name: "asc",
        },
      }),
    ]);
    return {
      success: true,
      data: {
        tables: JSON.parse(JSON.stringify(tables)),
        zones: JSON.parse(JSON.stringify(zones)),
      },
      message: "Tables retrieved successfully.",
    };
  } catch (e) {
    return errorAction(e);
  }
}
export default GetTables;
