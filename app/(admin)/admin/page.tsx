import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { PrismaClient } from "@prisma/client";
import RestaurantSelect from "@/components/admin/RestaurantSelect";
import RouteGuard from "@/components/shared/RouteGuard";
import type { CompanyGroup } from "@/app/types/restaurant";

const prisma = new PrismaClient();

async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const sessionUser = session.user as {
    role: string;
    restaurantId?: string;
    branchId?: string;
    name?: string;
    companyId?: string;
  };
  const { role, restaurantId, branchId, name, companyId } = sessionUser;

  // For non-owner users, redirect to their branch
  if (role !== "owner" && restaurantId && branchId) {
    redirect(`/admin/${restaurantId}/${branchId}`);
  }

  // For owners, fetch restaurant data
  let groups: CompanyGroup[] = [];

  if (role === "owner" && companyId) {
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

    if (company) {
      groups = [
        {
          company: { id: company.id, name: company.name },
          restaurants: company.restaurant.map((restaurant) => ({
            id: restaurant.id,
            name: restaurant.name,
            branches: restaurant.branches,
          })),
        },
      ];
    }
  }

  return (
    <RouteGuard allow={["owner"]}>
      <RestaurantSelect userName={name || "User"} groups={groups} />
    </RouteGuard>
  );
}

export default AdminPage;
