import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { PrismaClient } from "@prisma/client";
import BranchSelect from "@/components/admin/BranchSelect";
import RouteGuard from "@/components/shared/RouteGuard";
import type { Restaurant } from "@/app/types/restaurant";
import { authenticatedUser } from "@/app/types/admin";

const prisma = new PrismaClient();

type Params = {
  restaurantId: string;
};

async function BranchSelectPage({ params }: { params: Promise<Params> }) {
  const { restaurantId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const sessionUser = session.user as authenticatedUser;
  const { role, name } = sessionUser;

  if (role !== "owner") {
    redirect("/admin");
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: { branches: true },
  });

  if (!restaurant) {
    redirect("/admin");
  }

  return (
    <RouteGuard allow={["owner"]}>
      <BranchSelect
        userName={name || "User"}
        restaurant={restaurant as unknown as Restaurant}
      />
    </RouteGuard>
  );
}

export default BranchSelectPage;
