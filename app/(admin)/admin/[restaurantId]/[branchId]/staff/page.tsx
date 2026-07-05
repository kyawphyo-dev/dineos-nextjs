import StaffDashboard from "@/components/admin/StaffDashboard";
import RouteGuard from "@/components/shared/RouteGuard";
import { GetAllUsers } from "@/lib/actions/GetAllUsers.action";
import type { StaffMember, Zone } from "@/app/types/admin";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import { Params } from "../page";

export default async function StaffPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return <div>Unauthorized</div>;
  }
  const { restaurantId, branchId } = await params;

  const result = await GetAllUsers({
    restaurantId,
    branchId,
    page: 1,
    pageSize: 15,
    search: "",
    filter: "",
  });

  if (!result || !result.success) {
    return <div>Error loading staff</div>;
  }
  console.log(result);
  const {
    totalUsers = 0,
    users = [],
    zoneList = [],
    restaurant,
    branch,
  } = result.data || {};

  const mappedStaff: StaffMember[] = users.map((user: any) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    restaurantId: user.restaurantId,
    branchId: user.branchId,
    zoneId: user.zoneId,
    status: user.status,
    zone: user.zone || undefined,
  }));

  return (
    <RouteGuard allow={["owner", "manager"]}>
      <StaffDashboard
        staff={mappedStaff}
        totalStaff={totalUsers}
        zoneList={zoneList || []}
        restaurant={restaurant || { id: restaurantId, name: "" }}
        branch={branch || { id: branchId, name: "" }}
        currentUser={session.user}
      />
    </RouteGuard>
  );
}
