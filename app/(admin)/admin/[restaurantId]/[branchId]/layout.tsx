import Sidebar from "@/components/admin/Sidebar";
import GetRestaurant from "@/lib/actions/GetRestaurant.action";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

type Params = {
  restaurantId: string;
  branchId: string;
};

export default async function BranchLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const { restaurantId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  let restaurantName: string = "DineOS Admin";
  console.log("SESSION DATA:", session);
  console.log("URL restaurantId:", restaurantId);

  // Use the restaurantId from the URL for all users (both owner and staff)
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { name: true },
  });
  console.log("Restaurant fetch by URL id result:", restaurant);
  if (restaurant) {
    restaurantName = restaurant.name;
  }
  console.log("Final restaurantName:", restaurantName);
  return (
    <div className="flex min-h-screen">
      <Sidebar restaurantName={restaurantName} />
      <main className="flex-1 px-5 sm:px-8 py-6 max-w-6xl">{children}</main>
    </div>
  );
}
